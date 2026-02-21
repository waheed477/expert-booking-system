const Booking = require('../models/Booking');
const Expert = require('../models/Expert');

// Create booking without transactions
exports.createBooking = async (req, res) => {
  try {
    const { expertId, bookingDate, timeSlot, ...bookingData } = req.body;
    
    console.log('🔍 Creating booking with expertId:', expertId);
    
    // Check if slot is available
    const expert = await Expert.findById(expertId);
    if (!expert) {
      return res.status(404).json({ error: 'Expert not found' });
    }
    
    // Find and update the specific slot
    const slotDate = new Date(bookingDate);
    let slotFound = false;
    
    // Update the slot
    expert.availableSlots = expert.availableSlots.map(dateSlot => {
      if (new Date(dateSlot.date).toDateString() === slotDate.toDateString()) {
        const updatedSlots = dateSlot.slots.map(slot => {
          if (slot.time === timeSlot && !slot.isBooked) {
            slotFound = true;
            return { ...slot, isBooked: true, bookedBy: bookingData.userEmail };
          }
          return slot;
        });
        return { ...dateSlot, slots: updatedSlots };
      }
      return dateSlot;
    });
    
    if (!slotFound) {
      return res.status(400).json({ error: 'Slot not available or already booked' });
    }
    
    // Save expert with updated slot
    await expert.save();
    
    // Create booking
    const booking = new Booking({
      ...bookingData,
      expertId,
      expertName: expert.name,
      bookingDate,
      timeSlot,
      amount: expert.hourlyRate
    });
    
    await booking.save();
    
    // Emit real-time update
    if (req.app.get('io')) {
      req.app.get('io').emit('slotBooked', {
        expertId,
        date: bookingDate,
        timeSlot,
        bookingId: booking.bookingId
      });
    }
    
    res.status(201).json(booking);
  } catch (error) {
    console.error('Booking error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({ 
        error: 'This slot was just booked by someone else. Please choose another time.' 
      });
    }
    
    res.status(400).json({ error: error.message });
  }
};

// Get bookings by email
exports.getBookingsByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    console.log('📅 Fetching bookings for email:', email);
    
    const bookings = await Booking.find({ userEmail: email })
      .sort({ createdAt: -1 });
    
    console.log(`📅 Found ${bookings.length} bookings`);
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // If cancelled, free up the slot
    if (status === 'cancelled') {
      const expert = await Expert.findById(booking.expertId);
      if (expert) {
        expert.availableSlots = expert.availableSlots.map(dateSlot => {
          if (new Date(dateSlot.date).toDateString() === new Date(booking.bookingDate).toDateString()) {
            const updatedSlots = dateSlot.slots.map(slot => {
              if (slot.time === booking.timeSlot) {
                return { ...slot, isBooked: false, bookedBy: null };
              }
              return slot;
            });
            return { ...dateSlot, slots: updatedSlots };
          }
          return dateSlot;
        });
        
        await expert.save();
        
        // Emit slot freed event
        if (req.app.get('io')) {
          req.app.get('io').emit('slotFreed', {
            expertId: booking.expertId,
            date: booking.bookingDate,
            timeSlot: booking.timeSlot
          });
        }
      }
    }
    
    res.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: error.message });
  }
};