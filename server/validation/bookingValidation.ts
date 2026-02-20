import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

const bookingSchema = Joi.object({
  expertId: Joi.number().required(), // Changed to number to match schema.ts serial ID
  userName: Joi.string().min(3).max(50).required(),
  userEmail: Joi.string().email().required(),
  userPhone: Joi.string().pattern(/^[0-9]{10}$/).required(),
  bookingDate: Joi.string().required(), // Using string as per schema.ts text type
  timeSlot: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/).required(),
  notes: Joi.string().max(500).optional(),
  expertName: Joi.string().required(),
  amount: Joi.number().required(),
  bookingId: Joi.string().required()
});

export const validateBooking = (req: Request, res: Response, next: NextFunction) => {
  const { error } = bookingSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }
  next();
};
