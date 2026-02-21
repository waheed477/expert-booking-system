const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  expertId: { type: String, required: true }, // Changed from Number to String
  expertName: { type: String, required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true, index: true },
  userPhone: { type: String, required: true },
  bookingDate: { type: String, required: true },
  timeSlot: { type: String, required: true },
  notes: { type: String, default: '' },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'confirmed'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);