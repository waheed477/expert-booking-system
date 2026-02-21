import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from 'axios';
import { api, buildUrl, type BookingInput, type BookingResponse } from "@/shared/routes";
import { type ExpertWithAvailability, type Booking } from "@/shared/schema";
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// --- Experts ---

export function useExperts(filters?: { category?: string; search?: string; page?: number }) {
  return useQuery({
    queryKey: ['experts', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.category && filters.category !== 'all') {
        params.append('category', filters.category);
      }
      if (filters?.search) {
        params.append('search', filters.search);
      }
      if (filters?.page) {
        params.append('page', filters.page.toString());
      }
      
      const url = `${API_URL}/api/experts${params.toString() ? `?${params}` : ''}`;
      console.log('Fetching experts from:', url);
      
      const { data } = await axios.get(url);
      console.log('Experts response:', data);
      
      return data;
    },
  });
}

export function useExpert(id: string) {
  return useQuery({
    queryKey: ['expert', id],
    queryFn: async () => {
      const url = `${API_URL}/api/experts/${id}`;
      console.log('Fetching expert from:', url);
      
      const { data } = await axios.get(url);
      return data;
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
      const url = `${API_URL}/api/bookings?email=${encodeURIComponent(email)}`;
      console.log('Fetching bookings from:', url);
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();
      console.log('Bookings response:', data);
      return data as Booking[];
    },
    enabled: !!email,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      console.log('🔍 CreateBooking - Input data:', data);
      
      const url = `${API_URL}/api/bookings`;
      console.log('🔍 CreateBooking - URL:', url);
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      const text = await res.text();
      console.log('🔍 CreateBooking - Raw response:', text);
      
      if (!res.ok) {
        let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
        try {
          if (text) {
            const error = JSON.parse(text);
            errorMessage = error.error || error.message || errorMessage;
          }
        } catch (e) {
          // Ignore parsing error
        }
        throw new Error(errorMessage);
      }
      
      try {
        return text ? JSON.parse(text) : { success: true };
      } catch (e) {
        return { success: true, raw: text };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.bookings.list.path] });
      queryClient.invalidateQueries({ queryKey: ['experts'] });
      queryClient.invalidateQueries({ queryKey: ['expert'] });
    },
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      console.log('🔍 Updating booking status - ID:', id, 'Status:', status);
      
      if (!id) {
        throw new Error('Booking ID is required');
      }
      
      const url = `${API_URL}/api/bookings/${id}/status`;
      console.log('🔍 Update URL:', url);
      
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      
      const text = await res.text();
      console.log('🔍 Update response:', text);
      
      if (!res.ok) {
        let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
        try {
          if (text) {
            const error = JSON.parse(text);
            errorMessage = error.error || error.message || errorMessage;
          }
        } catch (e) {
          // Ignore parsing error
        }
        throw new Error(errorMessage);
      }
      
      try {
        return text ? JSON.parse(text) : { success: true };
      } catch (e) {
        return { success: true };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.bookings.list.path] });
      toast.success('Booking cancelled successfully');
    },
    onError: (error) => {
      console.error('❌ Cancel error:', error);
      toast.error(error.message || 'Failed to cancel booking');
    },
  });
}