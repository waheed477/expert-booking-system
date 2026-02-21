const mongoose = require('mongoose');

const expertSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Astrology', 'Vastu', 'Numerology', 'Tarot', 'Palmistry']
  },
  experience: { type: Number, required: true },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  bio: { type: String, required: true },
  profileImage: { type: String, default: '' },
  hourlyRate: { type: Number, required: true },
  languages: [{ type: String }],
  availableSlots: [{
    date: { type: Date, required: true },
    slots: [{
      time: { type: String, required: true },
      isBooked: { type: Boolean, default: false },
      bookedBy: { type: String, default: null }
    }]
  }]
}, { timestamps: true });

module.exports = mongoose.model('Expert', expertSchema);