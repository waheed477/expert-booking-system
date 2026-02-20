import { z } from 'zod';
import { insertBookingSchema, experts, bookings } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  experts: {
    list: {
      method: 'GET' as const,
      path: '/api/experts' as const,
      input: z.object({
        category: z.string().optional(),
        search: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.any()), // Will return ExpertWithAvailability[]
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/experts/:id' as const,
      responses: {
        200: z.any(), // Will return ExpertWithAvailability
        404: errorSchemas.notFound,
      },
    },
  },
  bookings: {
    list: {
      method: 'GET' as const,
      path: '/api/bookings' as const,
      input: z.object({
        email: z.string(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof bookings.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/bookings' as const,
      input: insertBookingSchema,
      responses: {
        201: z.custom<typeof bookings.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/bookings/:id/status' as const,
      input: z.object({ status: z.string() }),
      responses: {
        200: z.custom<typeof bookings.$inferSelect>(),
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
    selectSlot: z.object({ expertId: z.number(), date: z.string(), time: z.string() }),
  },
  receive: {
    slotBooked: z.object({ expertId: z.number(), date: z.string(), time: z.string() }),
    slotSelected: z.object({ expertId: z.number(), date: z.string(), time: z.string() }),
  },
};

export type BookingInput = z.infer<typeof api.bookings.create.input>;
export type BookingResponse = z.infer<typeof api.bookings.create.responses[201]>;
export type BookingUpdateStatusInput = z.infer<typeof api.bookings.updateStatus.input>;