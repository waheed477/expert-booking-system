import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
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
      const { category, search } = req.query;
      const experts = await storage.getExperts(category as string, search as string);
      res.json(experts);
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

  app.post(api.bookings.create.path, async (req, res) => {
    try {
      // Coerce some specific fields for robustness
      const bodySchema = api.bookings.create.input.extend({
        expertId: z.coerce.number(),
        amount: z.coerce.number(),
      });
      const input = bodySchema.parse(req.body);
      
      // Check availability and prevent double booking
      const isAvailable = await storage.checkSlotAvailability(input.expertId, input.bookingDate, input.timeSlot);
      if (!isAvailable) {
        return res.status(400).json({ message: "Time slot is no longer available." });
      }

      const booking = await storage.createBooking(input);
      await storage.markSlotBooked(input.expertId, input.bookingDate, input.timeSlot);

      // Broadcast 'slotBooked' event
      const payload = { expertId: input.expertId, date: input.bookingDate, time: input.timeSlot };
      broadcastMessage({ type: "slotBooked", payload });

      res.status(201).json(booking);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.patch(api.bookings.updateStatus.path, async (req, res) => {
    try {
      const { status } = req.body;
      const updated = await storage.updateBookingStatus(Number(req.params.id), status);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  // --- WebSockets ---
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  const clients = new Set<WebSocket>();

  function broadcastMessage(message: any) {
    const data = JSON.stringify(message);
    Array.from(clients).forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  wss.on("connection", (ws) => {
    clients.add(ws);

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        // Handle selectSlot event for temporary lock visualization
        if (message.type === "selectSlot") {
          const payload = message.payload;
          // Broadcast to all other clients to show 'slotSelected'
          const broadcastData = JSON.stringify({
            type: "slotSelected",
            payload: { expertId: payload.expertId, date: payload.date, time: payload.time }
          });
          
          Array.from(clients).forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(broadcastData);
            }
          });
        }
      } catch (err) {
        console.error("WebSocket message parse error:", err);
      }
    });

    ws.on("close", () => {
      clients.delete(ws);
    });
  });

  return httpServer;
}