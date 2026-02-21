// Simplified schema types for frontend use
// These are TypeScript types only, no database dependencies

export type Expert = {
  id: number;
  name: string;
  category: string;
  experience: number;
  rating: number;
  totalReviews: number;
  bio: string;
  profileImage: string | null;
  hourlyRate: number;
  languages: string[];
};

export type ExpertAvailability = {
  id: number;
  expertId: number;
  date: string;
  time: string;
  isBooked: boolean;
  bookedBy: string | null;
};

export type Booking = {
  id: number;
  bookingId: string;
  expertId: number;
  expertName: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  bookingDate: string;
  timeSlot: string;
  notes: string | null;
  status: string;
  amount: number;
  createdAt: Date;
};

export type InsertBooking = {
  expertId: number;
  userName: string;
  userEmail: string;
  userPhone: string;
  bookingDate: string;
  timeSlot: string;
  notes?: string;
  amount: number;
};

// Extended Expert with availability for the frontend
export type ExpertWithAvailability = Expert & {
  availableSlots: {
    date: string;
    slots: { time: string; isBooked: boolean }[];
  }[];
};

export type CreateBookingRequest = InsertBooking;
export type UpdateBookingStatusRequest = { status: string };
