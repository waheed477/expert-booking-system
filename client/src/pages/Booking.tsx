import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { Loader2, Calendar, Clock, ArrowLeft, ShieldCheck } from "lucide-react";
import { useExpert, useCreateBooking } from "@/hooks/use-experts";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import toast from 'react-hot-toast';
import { Toast } from "@/components/common/Toast";
import { useSocket } from '@/context/SocketContext';

// Enhanced schema with better validation
const bookingFormSchema = z.object({
  userName: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name is too long"),
  userEmail: z.string()
    .email("Please enter a valid email address")
    .min(5, "Email is required"),
  userPhone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number is too long")
    .regex(/^[0-9+\-\s()]+$/, "Please enter a valid phone number"),
  notes: z.string()
    .max(500, "Notes cannot exceed 500 characters")
    .optional(),
  terms: z.boolean()
    .refine((val) => val === true, "You must accept the terms and conditions"),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

export default function Booking() {
  const [, params] = useRoute("/booking/:expertId");
  const expertIdFromUrl = params?.expertId || "";
  
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get date and time from URL params
  const searchParams = new URLSearchParams(window.location.search);
  const date = searchParams.get("date");
  const time = searchParams.get("time");

  console.log('🔍 Booking - expertId (string):', expertIdFromUrl);

  // useExpert expects string ID
  const { data: expert, isLoading: isExpertLoading } = useExpert(expertIdFromUrl);
  const { mutate: createBooking, isPending: isBookingPending } = useCreateBooking();
  const { socket } = useSocket();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      userName: "",
      userEmail: "",
      userPhone: "",
      notes: "",
      terms: false,
    },
    mode: "onBlur",
  });

  // Redirect if no date/time
  useEffect(() => {
    if (!date || !time) {
      toast.error("Please select a date and time first");
      setLocation(`/expert/${expertIdFromUrl}`);
    }
  }, [date, time, expertIdFromUrl, setLocation]);

  if (isExpertLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!expert) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <h2 className="text-xl font-bold">Expert not found</h2>
        <p className="text-gray-500">ID: {expertIdFromUrl}</p>
        <Button onClick={() => setLocation("/")}>Go Home</Button>
      </div>
    );
  }

  if (!date || !time) {
    return null;
  }

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    
    try {
      // Generate a random booking ID
      const bookingId = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;

     // Just ensure expertId is string
const payload = {
  bookingId: `BK${Date.now()}${Math.floor(Math.random() * 1000)}`,
  expertId: expertIdFromUrl, // MUST be string
  expertName: expert.name,
  userName: data.userName.trim(),
  userEmail: data.userEmail.trim().toLowerCase(),
  userPhone: data.userPhone.trim(),
  bookingDate: date,
  timeSlot: time,
  notes: data.notes?.trim() || "",
  amount: expert.hourlyRate,
  status: "confirmed"
};

      console.log('🔍 Booking - Submitting payload:', payload);

      createBooking(payload, {
        onSuccess: (booking) => {
          toast.success('🎉 Booking confirmed successfully!');
          
          // Store email in localStorage for MyBookings page
          localStorage.setItem('lastBookingEmail', data.userEmail);
          
          // Emit socket event with string ID
          socket?.emit('booking-created', {
            expertId: expertIdFromUrl,
            date,
            timeSlot: time,
            bookingId: booking.id || booking.bookingId
          });
          
          // Navigate to confirmation page
          const confirmationId = booking.id || booking.bookingId || bookingId;
          setLocation(`/confirmation/${confirmationId}`);
          
          setIsSubmitting(false);
        },
        onError: (error: any) => {
          console.error('Booking error:', error);
          
          if (error.message?.includes('duplicate') || error.message?.includes('already booked')) {
            toast.error('This slot was just taken. Please select another time.');
            setTimeout(() => {
              setLocation(`/expert/${expertIdFromUrl}`);
            }, 2000);
          } else {
            toast.error(error.message || 'Booking failed. Please try again.');
          }
          setIsSubmitting(false);
        },
      });
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  const onError = (errors: any) => {
    console.log('Form validation errors:', errors);
    toast.error('Please fix the errors in the form');
  };

  const isLoading = isExpertLoading || isBookingPending || isSubmitting;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Toast />
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Button 
          variant="ghost" 
          onClick={() => window.history.back()}
          className="mb-6 pl-0 hover:bg-transparent hover:text-indigo-600 transition-colors"
          disabled={isLoading}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Expert
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form */}
          <div className="lg:col-span-2">
            <Card className="border-none shadow-xl bg-white rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
                <CardTitle className="text-xl font-display">Complete Your Booking</CardTitle>
                <p className="text-indigo-100 text-sm">
                  Session with {expert.name} on {format(parseISO(date), "MMMM d, yyyy")} at {time}
                </p>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="userName" className="text-sm font-medium">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        id="userName" 
                        {...form.register("userName")} 
                        className="h-12 rounded-lg border-slate-200 focus-visible:ring-indigo-500 transition-shadow"
                        placeholder="John Doe"
                        disabled={isLoading}
                        aria-invalid={!!form.formState.errors.userName}
                      />
                      {form.formState.errors.userName && (
                        <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                          <span>⚠️</span> {form.formState.errors.userName.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="userEmail" className="text-sm font-medium">
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        id="userEmail" 
                        type="email"
                        {...form.register("userEmail")}
                        className="h-12 rounded-lg border-slate-200 focus-visible:ring-indigo-500 transition-shadow"
                        placeholder="john@example.com"
                        disabled={isLoading}
                        aria-invalid={!!form.formState.errors.userEmail}
                      />
                      {form.formState.errors.userEmail && (
                        <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                          <span>⚠️</span> {form.formState.errors.userEmail.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userPhone" className="text-sm font-medium">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="userPhone" 
                      type="tel"
                      placeholder="+1 234 567 8900"
                      {...form.register("userPhone")}
                      className="h-12 rounded-lg border-slate-200 focus-visible:ring-indigo-500 transition-shadow"
                      disabled={isLoading}
                      aria-invalid={!!form.formState.errors.userPhone}
                    />
                    {form.formState.errors.userPhone && (
                      <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                        <span>⚠️</span> {form.formState.errors.userPhone.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-medium">
                      Notes for the Expert (Optional)
                    </Label>
                    <Textarea 
                      id="notes" 
                      placeholder="Share your birth details, specific questions, or anything you'd like the expert to know..."
                      className="min-h-[120px] rounded-lg border-slate-200 focus-visible:ring-indigo-500 resize-none transition-shadow"
                      {...form.register("notes")}
                      disabled={isLoading}
                    />
                    {form.watch("notes") && form.watch("notes")!.length > 400 && (
                      <p className="text-xs text-amber-600 text-right">
                        {form.watch("notes")!.length}/500 characters
                      </p>
                    )}
                  </div>

                  <div className="flex items-start space-x-3 pt-4 border-t border-slate-100">
                    <Checkbox 
                      id="terms" 
                      checked={form.watch("terms")}
                      onCheckedChange={(c) => form.setValue("terms", c === true, { shouldValidate: true })}
                      disabled={isLoading}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="terms" className="text-sm font-medium text-slate-700">
                        I agree to the <a href="/terms" className="text-indigo-600 hover:underline" target="_blank">Terms of Service</a> and <a href="/privacy" className="text-indigo-600 hover:underline" target="_blank">Privacy Policy</a>
                      </Label>
                      {form.formState.errors.terms && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <span>⚠️</span> {form.formState.errors.terms.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-14 mt-6 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl disabled:opacity-70"
                    disabled={isLoading || !form.formState.isValid}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Confirm Booking · $${expert.hourlyRate}`
                    )}
                  </Button>

                  {!form.formState.isValid && form.formState.isSubmitted && (
                    <p className="text-center text-sm text-red-500 mt-2">
                      Please fill all required fields correctly
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Summary */}
          <div className="lg:col-span-1">
            <Card className="border-none bg-gradient-to-b from-indigo-50/80 to-white rounded-2xl p-6 sticky top-24 shadow-lg">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
                Booking Summary
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shadow-md border-2 border-white">
                    <img 
                      src={expert.profileImage || "https://via.placeholder.com/100"} 
                      alt={expert.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/100";
                      }}
                    />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{expert.name}</p>
                    <p className="text-sm text-slate-600">{expert.category} Expert</p>
                    <p className="text-xs text-slate-500 mt-1">⭐ {expert.rating} · {expert.experience} years</p>
                  </div>
                </div>

                <div className="space-y-3 bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                  <div className="flex items-center gap-3 text-slate-700">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <span className="font-medium">{format(parseISO(date), "EEEE, MMMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span className="font-medium">{time} ({expert.timezone || 'Your local time'})</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="font-medium text-emerald-600">60 min video consultation</span>
                  </div>
                </div>

                <Separator className="bg-indigo-200" />

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Session fee</span>
                    <span>${expert.hourlyRate}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Platform fee</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold text-slate-900 pt-2">
                    <span>Total</span>
                    <span className="text-indigo-600">${expert.hourlyRate}</span>
                  </div>
                </div>

                <div className="bg-indigo-50 p-3 rounded-lg text-xs text-slate-600">
                  <p className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-indigo-600" />
                    Your payment is secure and encrypted
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}