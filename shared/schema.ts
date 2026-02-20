import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const experts = pgTable("experts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // 'Astrology', 'Vastu', 'Numerology', 'Tarot'
  experience: integer("experience").notNull(),
  rating: integer("rating").notNull().default(0), // Stored as rating * 10 (e.g. 48 = 4.8)
  totalReviews: integer("total_reviews").notNull().default(0),
  bio: text("bio").notNull(),
  profileImage: text("profile_image"),
  hourlyRate: integer("hourly_rate").notNull(),
  languages: jsonb("languages").notNull().$type<string[]>(),
});

export const expertAvailability = pgTable("expert_availability", {
  id: serial("id").primaryKey(),
  expertId: integer("expert_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  time: text("time").notNull(), // e.g., "09:00 AM"
  isBooked: boolean("is_booked").notNull().default(false),
  bookedBy: text("booked_by"),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  bookingId: text("booking_id").notNull().unique(), // e.g., "BOK-12345"
  expertId: integer("expert_id").notNull(),
  expertName: text("expert_name").notNull(),
  userName: text("user_name").notNull(),
  userEmail: text("user_email").notNull(),
  userPhone: text("user_phone").notNull(),
  bookingDate: text("booking_date").notNull(),
  timeSlot: text("time_slot").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("pending"), // 'pending', 'confirmed', 'completed', 'cancelled'
  amount: integer("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const expertsRelations = relations(experts, ({ many }) => ({
  availability: many(expertAvailability),
  bookings: many(bookings),
}));

export const insertExpertSchema = createInsertSchema(experts).omit({ id: true });
export const insertExpertAvailabilitySchema = createInsertSchema(expertAvailability).omit({ id: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true });

export type Expert = typeof experts.$inferSelect;
export type InsertExpert = z.infer<typeof insertExpertSchema>;

export type ExpertAvailability = typeof expertAvailability.$inferSelect;
export type InsertExpertAvailability = z.infer<typeof insertExpertAvailabilitySchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

// Request Types
export type CreateBookingRequest = InsertBooking;
export type UpdateBookingStatusRequest = { status: string };

// Extended Expert with availability for the frontend
export type ExpertWithAvailability = Expert & {
  availableSlots: {
    date: string;
    slots: { time: string; isBooked: boolean }[];
  }[];
};