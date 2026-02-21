import { useState, useEffect } from "react";
import { useBookings, useUpdateBookingStatus } from "@/hooks/use-experts";
import { Header } from "@/components/layout/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Search, Calendar, Clock, Loader2, XCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { BookingCardSkeleton } from "@/components/common/LoadingSkeleton";
import toast from 'react-hot-toast';

export default function MyBookings() {
  const [email, setEmail] = useState("");
  const [queryEmail, setQueryEmail] = useState("");
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Load last used email from localStorage on component mount
  useEffect(() => {
    const lastEmail = localStorage.getItem('lastBookingEmail');
    if (lastEmail) {
      setEmail(lastEmail);
      setQueryEmail(lastEmail);
    }
  }, []);
  
  const { data: bookings, isLoading, refetch } = useBookings(queryEmail);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateBookingStatus();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQueryEmail(email);
    localStorage.setItem('lastBookingEmail', email);
    setStatusFilter('all');
  };

  const handleCancelBooking = (bookingId: string) => {
    console.log('🔍 Cancelling booking with ID:', bookingId);
    
    if (!bookingId) {
      console.error('❌ Booking ID is undefined!');
      toast.error('Cannot cancel: Booking ID not found');
      return;
    }
    
    updateStatus({ id: bookingId, status: "cancelled" }, {
      onSuccess: () => {
        toast.success('Booking cancelled successfully');
        refetch(); // Refresh the bookings list
      },
      onError: (error) => {
        console.error('❌ Cancel error:', error);
        toast.error(error.message || 'Failed to cancel booking');
      }
    });
  };

  const filteredBookings = bookings?.filter(booking => 
    statusFilter === 'all' ? true : booking.status === statusFilter
  );

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Debug logs
  console.log('🔍 MyBookings - Email:', queryEmail);
  console.log('🔍 MyBookings - Bookings:', bookings);
  console.log('🔍 MyBookings - Filtered:', filteredBookings);
  console.log('🔍 MyBookings - Status Filter:', statusFilter);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-display font-bold text-slate-900 mb-8">My Bookings</h1>

        {/* Email Search */}
        <Card className="mb-8 border-none shadow-md bg-white rounded-2xl overflow-hidden">
          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-4 items-end md:items-center">
            <div className="flex-1 w-full">
              <label className="text-sm font-medium text-slate-600 mb-1 block">
                Enter your email to view bookings
              </label>
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="john@example.com"
                  className="h-12 rounded-xl text-lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button type="submit" className="h-12 w-12 md:w-auto rounded-xl bg-indigo-600 hover:bg-indigo-700">
                  <Search className="w-5 h-5 md:mr-2" />
                  <span className="hidden md:inline">Find Bookings</span>
                </Button>
              </form>
            </div>
          </div>
        </Card>

        {queryEmail && (
          <div className="w-full">
            {/* Status Tabs */}
            <div className="flex gap-2 mb-6 border-b overflow-x-auto pb-1">
              {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 capitalize whitespace-nowrap transition-colors ${
                    statusFilter === status
                      ? 'text-indigo-600 border-b-2 border-indigo-600 font-medium'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {status} ({status === 'all' ? bookings?.length || 0 : bookings?.filter(b => b.status === status).length || 0})
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="grid gap-4">
                {[...Array(3)].map((_, i) => (
                  <BookingCardSkeleton key={i} />
                ))}
              </div>
            ) : bookings && bookings.length > 0 ? (
              <div className="space-y-4">
                {filteredBookings && filteredBookings.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                    <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-slate-900">No {statusFilter} bookings found</h3>
                    <p className="mt-1 text-sm text-slate-500">No {statusFilter === 'all' ? '' : statusFilter} bookings found for this email.</p>
                  </div>
                ) : (
                  filteredBookings?.map((booking) => {
                    console.log('🔍 Rendering booking:', booking); // Debug log
                    
                    return (
                      <Card key={booking._id || booking.id} className="border-slate-200 hover:border-indigo-200 transition-all hover:shadow-md bg-white overflow-hidden">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-bold text-lg text-slate-900">{booking.expertName}</h3>
                                <Badge variant="outline" className={`capitalize font-medium ${getStatusBadge(booking.status)}`}>
                                  {booking.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-500 font-mono mb-4">ID: {booking.bookingId}</p>
                              
                              <div className="flex flex-wrap gap-4 md:gap-8 text-slate-700">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-indigo-500" />
                                  <span className="font-medium">{format(parseISO(booking.bookingDate), "MMM d, yyyy")}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-indigo-500" />
                                  <span className="font-medium">{booking.timeSlot}</span>
                                </div>
                              </div>
                            </div>

                            {(booking.status === "pending" || booking.status === "confirmed") && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                    disabled={isUpdating}
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Cancel Booking
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to cancel this booking? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => {
                                        console.log('🔍 Cancel button clicked for booking:', booking);
                                        const bookingId = booking._id || booking.id;
                                        console.log('🔍 Using booking ID:', bookingId);
                                        handleCancelBooking(bookingId);
                                      }}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Yes, Cancel
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            ) : queryEmail ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-slate-900">No bookings found</h3>
                <p className="mt-1 text-sm text-slate-500">No bookings found for this email.</p>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-slate-900">View your bookings</h3>
                <p className="mt-1 text-sm text-slate-500">Enter your email above to see your booking history.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}