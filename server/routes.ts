import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { experts, bookings, expertAvailability } from "@shared/schema";
import { db } from "./db";
import { eq, sql, and } from "drizzle-orm";
import errorHandler from "./middleware/errorHandler";
import { validateBooking } from "./validation/bookingValidation";
import cors from "cors";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use(cors());
  // --- Seed Data ---
  async function seedDatabase() {
    try {
      const existingExperts = await storage.getExperts();
      if (existingExperts.length === 0) {
        const expert1 = await storage.createExpert({
          name: "Dr. Anand Sharma",
          category: "Astrology",
          experience: 15,
          rating: 48, // 4.8
          totalReviews: 234,
          bio: "Dr. Anand Sharma is a renowned astrologer with 15+ years of experience. He specializes in Vedic astrology, horoscope matching, and career predictions. His accurate predictions have helped thousands of people make better life decisions.",
          profileImage: "https://randomuser.me/api/portraits/men/1.jpg",
          hourlyRate: 50,
          languages: ["Hindi", "English"],
        });

        const today = new Date();
        const tmrw = new Date(today);
        tmrw.setDate(tmrw.getDate() + 1);
        const day1 = today.toISOString().split('T')[0];
        const day2 = tmrw.toISOString().split('T')[0];

        const times1 = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"];
        for (const time of times1) {
          await storage.createAvailability({ expertId: expert1.id, date: day1, time, isBooked: time === "11:00 AM" });
        }

        const times2 = ["10:00 AM", "11:00 AM", "12:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];
        for (const time of times2) {
          await storage.createAvailability({ expertId: expert1.id, date: day2, time, isBooked: time === "04:00 PM" });
        }

        const expert2 = await storage.createExpert({
          name: "Prof. Vaidika Kumar",
          category: "Vastu",
          experience: 12,
          rating: 46, // 4.6
          totalReviews: 178,
          bio: "Prof. Vaidika Kumar is a certified Vastu consultant. She has transformed 500+ homes and offices using ancient Vastu principles combined with modern architecture. She provides practical solutions for positive energy flow.",
          profileImage: "https://randomuser.me/api/portraits/women/2.jpg",
          hourlyRate: 45,
          languages: ["Hindi", "English", "Sanskrit"],
        });

        const times3 = ["10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"];
        for (const time of times3) {
          await storage.createAvailability({ expertId: expert2.id, date: day1, time, isBooked: time === "03:00 PM" });
        }
        console.log("Database seeded successfully");
      }
    } catch (e) {
      console.error("Seed database failed:", e);
    }
  }
  
  seedDatabase();

  // --- REST Endpoints ---
  app.get(api.experts.list.path, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 6;
      const offset = (page - 1) * limit;
      const category = req.query.category as string;
      const search = req.query.search as string;

      let query = db.select().from(experts);

      if (category) {
        query = query.where(eq(experts.category, category)) as any;
      }

      if (search) {
        query = query.where(sql`LOWER(${experts.name}) LIKE LOWER(${`%${search}%`})`) as any;
      }

      const allResults = await query;
      const total = allResults.length;
      const results = allResults.slice(offset, offset + limit);

      res.json({
        data: results,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch experts" });
    }
  });

  app.get(api.experts.get.path, async (req, res) => {
    const expert = await storage.getExpert(Number(req.params.id));
    if (!expert) {
      return res.status(404).json({ message: "Expert not found" });
    }
    res.json(expert);
  });

  app.get(api.bookings.list.path, async (req, res) => {
    const { email } = req.query;
    if (!email) {
      return res.json([]);
    }
    const bookings = await storage.getBookingsByEmail(email as string);
    res.json(bookings);
  });

  app.post(api.bookings.create.path, validateBooking, async (req, res, next) => {
    try {
      const input = req.body;
      
      const isAvailable = await storage.checkSlotAvailability(input.expertId, input.bookingDate, input.timeSlot);
      if (!isAvailable) {
        return res.status(400).json({ message: "Time slot is no longer available." });
      }

      const booking = await storage.createBooking(input);
      await storage.markSlotBooked(input.expertId, input.bookingDate, input.timeSlot);

      const payload = { expertId: input.expertId, date: input.bookingDate, time: input.timeSlot };
      broadcastMessage({ type: "slotBooked", payload });

      res.status(201).json(booking);
    } catch (err) {
      next(err);
    }
  });

  app.patch(api.bookings.updateStatus.path, async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const [updatedBooking] = await db
        .update(bookings)
        .set({ status })
        .where(eq(bookings.id, parseInt(id)))
        .returning();

      if (!updatedBooking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      broadcastMessage({
        type: 'BOOKING_UPDATED',
        data: updatedBooking
      });

      res.json(updatedBooking);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/bookings/:id/cancel', async (req, res, next) => {
    try {
      const { id } = req.params;
      
      const [booking] = await db
        .update(bookings)
        .set({ status: 'cancelled' })
        .where(and(
          eq(bookings.id, parseInt(id)),
          eq(bookings.status, 'pending')
        ))
        .returning();

      if (!booking) {
        return res.status(400).json({ 
          error: 'Cannot cancel this booking' 
        });
      }

      await db
        .update(expertAvailability)
        .set({ isBooked: false, bookedBy: null })
        .where(and(
          eq(expertAvailability.expertId, booking.expertId),
          eq(expertAvailability.date, booking.bookingDate),
          eq(expertAvailability.time, booking.timeSlot)
        ));

      broadcastMessage({
        type: 'SLOT_FREED',
        data: {
          expertId: booking.expertId,
          date: booking.bookingDate,
          timeSlot: booking.timeSlot
        }
      });

      res.json({ success: true, booking });
    } catch (error) {
      next(error);
    }
  });

  app.use(errorHandler);

  return httpServer;
}