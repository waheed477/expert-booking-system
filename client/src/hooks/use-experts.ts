import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type BookingInput, type BookingResponse } from "@shared/routes";
import { type ExpertWithAvailability, type Booking } from "@shared/schema";

// --- Experts ---

export function useExperts(filters?: { category?: string; search?: string }) {
  return useQuery({
    queryKey: [api.experts.list.path, filters],
    queryFn: async () => {
      // Build query string manually or use a helper if URLSearchParams is preferred
      const queryParams = new URLSearchParams();
      if (filters?.category && filters.category !== "All") queryParams.append("category", filters.category);
      if (filters?.search) queryParams.append("search", filters.search);

      const url = `${api.experts.list.path}?${queryParams.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch experts");
      return await res.json() as ExpertWithAvailability[];
    },
  });
}

export function useExpert(id: number) {
  return useQuery({
    queryKey: [api.experts.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.experts.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch expert");
      return await res.json() as ExpertWithAvailability;
    },
    enabled: !!id,
  });
}

// --- Bookings ---

export function useBookings(email?: string) {
  return useQuery({
    queryKey: [api.bookings.list.path, email],
    queryFn: async () => {
      if (!email) return [];
      const url = `${api.bookings.list.path}?email=${encodeURIComponent(email)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch bookings");
      return await res.json() as Booking[];
    },
    enabled: !!email,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: BookingInput) => {
      const validated = api.bookings.create.input.parse(data);
      const res = await fetch(api.bookings.create.path, {
        method: api.bookings.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create booking");
      }
      
      return await res.json() as BookingResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.bookings.list.path] });
      // Also invalidate experts to refresh availability
      queryClient.invalidateQueries({ queryKey: [api.experts.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.experts.get.path] });
    },
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const url = buildUrl(api.bookings.updateStatus.path, { id });
      const res = await fetch(url, {
        method: api.bookings.updateStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      
      if (!res.ok) throw new Error("Failed to update booking status");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.bookings.list.path] });
    },
  });
}
