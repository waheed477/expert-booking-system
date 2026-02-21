const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Create booking
router.post('/', bookingController.createBooking);

// Get bookings by email
router.get('/', bookingController.getBookingsByEmail);

// Update booking status
router.patch('/:id/status', bookingController.updateBookingStatus);

// Cancel booking
router.post('/:id/cancel', bookingController.updateBookingStatus);

module.exports = router;