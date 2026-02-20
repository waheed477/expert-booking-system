import { db } from "./db";
import {
  experts,
  expertAvailability,
  bookings,
  type Expert,
  type ExpertAvailability,
  type Booking,
  type InsertExpert,
  type InsertExpertAvailability,
  type InsertBooking,
  type ExpertWithAvailability
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getExperts(category?: string, search?: string): Promise<ExpertWithAvailability[]>;
  getExpert(id: number): Promise<ExpertWithAvailability | undefined>;
  getBookingsByEmail(email: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking>;
  checkSlotAvailability(expertId: number, date: string, time: string): Promise<boolean>;
  markSlotBooked(expertId: number, date: string, time: string): Promise<void>;
  
  // Seed helpers
  createExpert(expert: InsertExpert): Promise<Expert>;
  createAvailability(availability: InsertExpertAvailability): Promise<ExpertAvailability>;
}

export class DatabaseStorage implements IStorage {
  async getExperts(category?: string, search?: string): Promise<ExpertWithAvailability[]> {
    let allExperts = await db.select().from(experts);
    
    if (category) {
      allExperts = allExperts.filter(e => e.category.toLowerCase() === category.toLowerCase());
    }
    
    if (search) {
      const s = search.toLowerCase();
      allExperts = allExperts.filter(e => e.name.toLowerCase().includes(s) || e.bio.toLowerCase().includes(s));
    }

    const result: ExpertWithAvailability[] = [];
    for (const exp of allExperts) {
      const avail = await db.select().from(expertAvailability).where(eq(expertAvailability.expertId, exp.id));
      
      const slotsByDate: Record<string, { time: string; isBooked: boolean }[]> = {};
      for (const a of avail) {
        if (!slotsByDate[a.date]) slotsByDate[a.date] = [];
        slotsByDate[a.date].push({ time: a.time, isBooked: a.isBooked });
      }
      
      result.push({
        ...exp,
        availableSlots: Object.entries(slotsByDate).map(([date, slots]) => ({ date, slots }))
      });
    }
    
    return result;
  }

  async getExpert(id: number): Promise<ExpertWithAvailability | undefined> {
    const [exp] = await db.select().from(experts).where(eq(experts.id, id));
    if (!exp) return undefined;
    
    const avail = await db.select().from(expertAvailability).where(eq(expertAvailability.expertId, id));
    const slotsByDate: Record<string, { time: string; isBooked: boolean }[]> = {};
    for (const a of avail) {
      if (!slotsByDate[a.date]) slotsByDate[a.date] = [];
      slotsByDate[a.date].push({ time: a.time, isBooked: a.isBooked });
    }
    
    return {
      ...exp,
      availableSlots: Object.entries(slotsByDate).map(([date, slots]) => ({ date, slots }))
    };
  }

  async getBookingsByEmail(email: string): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.userEmail, email));
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [created] = await db.insert(bookings).values(booking).returning();
    return created;
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking> {
    const [updated] = await db.update(bookings)
      .set({ status })
      .where(eq(bookings.id, id))
      .returning();
    return updated;
  }

  async checkSlotAvailability(expertId: number, date: string, time: string): Promise<boolean> {
    const [slot] = await db.select()
      .from(expertAvailability)
      .where(
        and(
          eq(expertAvailability.expertId, expertId),
          eq(expertAvailability.date, date),
          eq(expertAvailability.time, time)
        )
      );
    return slot ? !slot.isBooked : false;
  }

  async markSlotBooked(expertId: number, date: string, time: string): Promise<void> {
    await db.update(expertAvailability)
      .set({ isBooked: true })
      .where(
        and(
          eq(expertAvailability.expertId, expertId),
          eq(expertAvailability.date, date),
          eq(expertAvailability.time, time)
        )
      );
  }

  async createExpert(expert: InsertExpert): Promise<Expert> {
    const [created] = await db.insert(experts).values(expert as any).returning();
    return created;
  }

  async createAvailability(availability: InsertExpertAvailability): Promise<ExpertAvailability> {
    const [created] = await db.insert(expertAvailability).values(availability).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();