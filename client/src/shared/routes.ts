import { z } from 'zod';

// Add API base URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Error schemas
export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

// Booking type for responses
export const bookingSchema = z.object({
  id: z.number(),
  bookingId: z.string(),
  expertId: z.string(), // FIX: Changed from number to string
  expertName: z.string(),
  userName: z.string(),
  userEmail: z.string(),
  userPhone: z.string(),
  bookingDate: z.string(),
  timeSlot: z.string(),
  notes: z.string().nullable(),
  status: z.string(),
  amount: z.number(),
  createdAt: z.date(),
});

export type Booking = z.infer<typeof bookingSchema>;

// Expert type
export const expertSchema = z.object({
  id: z.number(),
  name: z.string(),
  category: z.string(),
  experience: z.number(),
  rating: z.number(),
  totalReviews: z.number(),
  bio: z.string(),
  profileImage: z.string().nullable(),
  hourlyRate: z.number(),
  languages: z.array(z.string()),
});

export type Expert = z.infer<typeof expertSchema>;

// Expert with availability
export const expertAvailabilitySlotSchema = z.object({
  date: z.string(),
  slots: z.array(z.object({
    time: z.string(),
    isBooked: z.boolean(),
  })),
});

export type ExpertWithAvailability = Expert & {
  availableSlots: z.infer<typeof expertAvailabilitySlotSchema>[];
};

// API routes with full URLs
export const api = {
  experts: {
    list: {
      method: 'GET' as const,
      path: `${API_BASE_URL}/api/experts` as const,
      input: z.object({
        category: z.string().optional(),
        search: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(expertAvailabilitySlotSchema),
      },
    },
    get: {
      method: 'GET' as const,
      path: `${API_BASE_URL}/api/experts/:id` as const,
      responses: {
        200: expertAvailabilitySlotSchema,
        404: errorSchemas.notFound,
      },
    },
  },
  bookings: {
    list: {
      method: 'GET' as const,
      path: `${API_BASE_URL}/api/bookings` as const,
      input: z.object({
        email: z.string(),
      }).optional(),
      responses: {
        200: z.array(bookingSchema),
      },
    },
    create: {
      method: 'POST' as const,
      path: `${API_BASE_URL}/api/bookings` as const,
      input: z.object({
        bookingId: z.string(),
        expertId: z.string(), // FIX: Changed from number to string
        expertName: z.string(),
        userName: z.string(),
        userEmail: z.string(),
        userPhone: z.string(),
        bookingDate: z.string(),
        timeSlot: z.string(),
        notes: z.string().optional(),
        amount: z.number(),
        status: z.string(),
      }),
      responses: {
        201: bookingSchema,
        400: errorSchemas.validation,
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: `${API_BASE_URL}/api/bookings/:id/status` as const,
      input: z.object({ status: z.string() }),
      responses: {
        200: bookingSchema,
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export const ws = {
  send: {
    selectSlot: z.object({ expertId: z.string(), date: z.string(), time: z.string() }),
  },
  receive: {
    slotBooked: z.object({ expertId: z.string(), date: z.string(), time: z.string() }),
    slotSelected: z.object({ expertId: z.string(), date: z.string(), time: z.string() }),
  },
};

export type BookingInput = z.infer<typeof api.bookings.create.input>;
export type BookingResponse = z.infer<typeof api.bookings.create.responses[201]>;
export type BookingUpdateStatusInput = z.infer<typeof api.bookings.updateStatus.input>;