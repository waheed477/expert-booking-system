import { useParams, useLocation } from "wouter";
import { useExpert } from "@/hooks/use-experts";
import { useWebSocket } from "@/hooks/use-websocket";
import { Header } from "@/components/layout/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Trophy, MessageCircle, Calendar, Clock, ChevronRight, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ExpertDetail() {
  const { id } = useParams();
  const expertId = parseInt(id || "0");
  const [, setLocation] = useLocation();
  const { data: expert, isLoading, isError } = useExpert(expertId);
  const { send, subscribe } = useWebSocket('/ws');

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());

  // Set default date when data loads
  useEffect(() => {
    if (expert?.availableSlots && expert.availableSlots.length > 0 && !selectedDate) {
      setSelectedDate(expert.availableSlots[0].date);
    }
  }, [expert, selectedDate]);

  // WebSocket subscriptions
  useEffect(() => {
    if (!expertId) return;

    // Join room
    send('join', { expertId });

    // Listen for booked slots
    const unsubscribeBooked = subscribe('slotBooked', (payload: any) => {
      if (payload.expertId === expertId) {
        setBookedSlots(prev => new Set(prev).add(`${payload.date}-${payload.time}`));
      }
    });

    return () => {
      unsubscribeBooked();
    };
  }, [expertId, send, subscribe]);

  const handleSlotSelect = (time: string) => {
    setSelectedSlot(time);
    send('selectSlot', { expertId, date: selectedDate, time });
  };

  const handleBooking = () => {
    if (selectedDate && selectedSlot) {
      // Navigate to booking page with query params
      const params = new URLSearchParams({
        date: selectedDate,
        time: selectedSlot
      });
      setLocation(`/booking/${expertId}?${params.toString()}`);
    }
  };

  if (isLoading) return <DetailSkeleton />;
  if (isError || !expert) return <div>Expert not found</div>;

  const currentDaySlots = expert.availableSlots.find(d => d.date === selectedDate)?.slots || [];
  const rating = (expert.rating / 10).toFixed(1);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Profile */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8 border-none shadow-xl shadow-indigo-500/5 bg-white rounded-3xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-10" />
              
              <div className="relative flex flex-col md:flex-row gap-8 items-start">
                <Avatar className="w-32 h-32 border-4 border-white shadow-xl rounded-2xl">
                  <AvatarImage src={expert.profileImage || ""} alt={expert.name} className="object-cover" />
                  <AvatarFallback className="text-4xl font-bold bg-indigo-100 text-indigo-600 rounded-2xl">
                    {expert.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-display font-bold text-slate-900">{expert.name}</h1>
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200">
                        Verified
                      </Badge>
                    </div>
                    <p className="text-lg font-medium text-slate-500">{expert.category} Expert</p>
                  </div>

                  <div className="flex flex-wrap gap-6 text-sm">
                    <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 text-amber-800 font-medium">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                      <span>{rating} Rating</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Trophy className="w-4 h-4 text-indigo-500" />
                      <span>{expert.experience} Years Experience</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <MessageCircle className="w-4 h-4 text-purple-500" />
                      <span>{expert.totalReviews} Reviews</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-8" />

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900">About Me</h3>
                <p className="text-slate-600 leading-relaxed text-lg">{expert.bio}</p>
              </div>

              <div className="mt-8">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Languages Spoken</h3>
                <div className="flex gap-2">
                  {(expert.languages as string[]).map(lang => (
                    <Badge key={lang} variant="outline" className="px-3 py-1 text-slate-600 border-slate-200">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Booking */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-none shadow-xl shadow-indigo-500/10 bg-white rounded-3xl overflow-hidden">
              <div className="p-6 bg-slate-900 text-white">
                <h2 className="text-xl font-bold font-display">Book a Session</h2>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">${expert.hourlyRate}</span>
                  <span className="text-slate-400">/ session</span>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Date Selector */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                    <Calendar className="w-4 h-4" />
                    Select Date
                  </label>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {expert.availableSlots.map((slot) => {
                      const dateObj = parseISO(slot.date);
                      const isSelected = selectedDate === slot.date;
                      return (
                        <button
                          key={slot.date}
                          onClick={() => setSelectedDate(slot.date)}
                          className={cn(
                            "flex flex-col items-center min-w-[70px] p-3 rounded-xl border transition-all",
                            isSelected 
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-md" 
                              : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"
                          )}
                        >
                          <span className="text-xs font-medium opacity-80">{format(dateObj, "EEE")}</span>
                          <span className="text-lg font-bold">{format(dateObj, "d")}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Slots */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                    <Clock className="w-4 h-4" />
                    Available Times
                  </label>
                  {currentDaySlots.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No slots available for this date
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {currentDaySlots.map((slot) => {
                        const isBooked = slot.isBooked || bookedSlots.has(`${selectedDate}-${slot.time}`);
                        const isSelected = selectedSlot === slot.time;
                        
                        return (
                          <button
                            key={slot.time}
                            disabled={isBooked}
                            onClick={() => handleSlotSelect(slot.time)}
                            className={cn(
                              "py-2 px-3 rounded-lg text-sm font-medium border transition-all relative overflow-hidden",
                              isBooked 
                                ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed decoration-slate-400" 
                                : isSelected
                                  ? "bg-indigo-600 border-indigo-600 text-white shadow-md ring-2 ring-indigo-200 ring-offset-1"
                                  : "bg-white border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600"
                            )}
                          >
                            {slot.time}
                            {isSelected && (
                              <motion.div
                                layoutId="check"
                                className="absolute top-1 right-1"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                              </motion.div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <Button 
                  className="w-full h-12 text-lg font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25"
                  disabled={!selectedSlot}
                  onClick={handleBooking}
                >
                  Continue Booking
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
                
                <p className="text-xs text-center text-slate-500 mt-4">
                  100% Secure Payment • Instant Confirmation
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Skeleton className="h-[400px] w-full rounded-3xl" />
        </div>
        <div className="lg:col-span-1">
          <Skeleton className="h-[500px] w-full rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
