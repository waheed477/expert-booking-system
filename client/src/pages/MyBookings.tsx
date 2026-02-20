import { useState } from "react";
import { useBookings, useUpdateBookingStatus } from "@/hooks/use-experts";
import { Header } from "@/components/layout/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Clock, Loader2, XCircle } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function MyBookings() {
  const [email, setEmail] = useState("");
  const [queryEmail, setQueryEmail] = useState("");
  const { data: bookings, isLoading } = useBookings(queryEmail);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateBookingStatus();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQueryEmail(email);
  };

  const handleCancel = (id: number) => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      updateStatus({ id, status: "cancelled" });
    }
  };

  const filteredBookings = (status: string) => {
    if (!bookings) return [];
    if (status === "all") return bookings;
    return bookings.filter((b) => b.status === status);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "pending": return "bg-amber-100 text-amber-700 border-amber-200";
      case "cancelled": return "bg-red-100 text-red-700 border-red-200";
      case "completed": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-slate-100 text-slate-700";
    }
  };

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
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6 bg-white p-1 rounded-xl shadow-sm border border-slate-200 w-full md:w-auto overflow-x-auto flex justify-start">
              <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">All Bookings</TabsTrigger>
              <TabsTrigger value="confirmed" className="rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">Confirmed</TabsTrigger>
              <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">Pending</TabsTrigger>
              <TabsTrigger value="completed" className="rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">Completed</TabsTrigger>
            </TabsList>

            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
              </div>
            ) : bookings && bookings.length > 0 ? (
              ["all", "confirmed", "pending", "completed"].map((tab) => (
                <TabsContent key={tab} value={tab} className="space-y-4">
                  {filteredBookings(tab).length === 0 ? (
                    <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">
                      No {tab === 'all' ? '' : tab} bookings found.
                    </div>
                  ) : (
                    filteredBookings(tab).map((booking) => (
                      <Card key={booking.id} className="border-slate-200 hover:border-indigo-200 transition-all hover:shadow-md bg-white overflow-hidden">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-bold text-lg text-slate-900">{booking.expertName}</h3>
                                <Badge variant="outline" className={`capitalize font-medium ${getStatusColor(booking.status)}`}>
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

                            {booking.status === "pending" || booking.status === "confirmed" ? (
                              <Button 
                                variant="outline" 
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={() => handleCancel(booking.id)}
                                disabled={isUpdating}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Cancel Booking
                              </Button>
                            ) : null}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
              ))
            ) : (
              <div className="text-center py-20 text-slate-500">
                No bookings found for this email.
              </div>
            )}
          </Tabs>
        )}
      </main>
    </div>
  );
}
