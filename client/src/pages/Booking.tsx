import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { Loader2, Calendar, Clock, ArrowLeft, ShieldCheck } from "lucide-react";
import { api, type BookingInput } from "@shared/routes";
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

// Schema for the form, extending the basic booking input requirements
const bookingFormSchema = z.object({
  userName: z.string().min(2, "Name is required"),
  userEmail: z.string().email("Invalid email address"),
  userPhone: z.string().min(10, "Phone number is required"),
  notes: z.string().optional(),
  terms: z.boolean().refine((val) => val === true, "You must accept the terms"),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

export default function Booking() {
  const [, params] = useRoute("/booking/:expertId");
  const expertId = parseInt(params?.expertId || "0");
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const date = searchParams.get("date");
  const time = searchParams.get("time");

  const { data: expert, isLoading: isExpertLoading } = useExpert(expertId);
  const { mutate: createBooking, isPending: isBookingPending } = useCreateBooking();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      terms: false,
    },
  });

  if (isExpertLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!expert || !date || !time) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <h2 className="text-xl font-bold">Invalid Booking Request</h2>
        <Button onClick={() => setLocation("/")}>Go Home</Button>
      </div>
    );
  }

  const onSubmit = (data: BookingFormData) => {
    // Generate a random booking ID for frontend demo purposes
    // Ideally backend handles this ID generation
    const bookingId = `BOK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const payload: BookingInput = {
      bookingId,
      expertId,
      expertName: expert.name,
      userName: data.userName,
      userEmail: data.userEmail,
      userPhone: data.userPhone,
      bookingDate: date,
      timeSlot: time,
      notes: data.notes,
      amount: expert.hourlyRate,
      status: "confirmed", // Auto-confirm for this demo
    };

    createBooking(payload, {
      onSuccess: (booking) => {
        toast.success('Booking confirmed successfully!');
        setLocation(`/confirmation/${booking.id}`);
      },
      onError: (error) => {
        toast.error(error.message || 'Booking failed. Please try again.');
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Toast />
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Button 
          variant="ghost" 
          onClick={() => window.history.back()}
          className="mb-6 pl-0 hover:bg-transparent hover:text-indigo-600"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Expert
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form */}
          <div className="lg:col-span-2">
            <Card className="border-none shadow-lg bg-white rounded-2xl overflow-hidden">
              <CardHeader className="bg-indigo-600 text-white p-6">
                <CardTitle className="text-xl font-display">Enter Your Details</CardTitle>
                <p className="text-indigo-100 text-sm">We'll send the meeting link to your email.</p>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="userName">Full Name</Label>
                      <Input 
                        id="userName" 
                        {...form.register("userName")} 
                        className="h-12 rounded-lg border-slate-200 focus-visible:ring-indigo-500"
                      />
                      {form.formState.errors.userName && (
                        <p className="text-xs text-red-500">{form.formState.errors.userName.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="userEmail">Email Address</Label>
                      <Input 
                        id="userEmail" 
                        type="email"
                        {...form.register("userEmail")}
                        className="h-12 rounded-lg border-slate-200 focus-visible:ring-indigo-500"
                      />
                      {form.formState.errors.userEmail && (
                        <p className="text-xs text-red-500">{form.formState.errors.userEmail.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userPhone">Phone Number</Label>
                    <Input 
                      id="userPhone" 
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      {...form.register("userPhone")}
                      className="h-12 rounded-lg border-slate-200 focus-visible:ring-indigo-500"
                    />
                    {form.formState.errors.userPhone && (
                      <p className="text-xs text-red-500">{form.formState.errors.userPhone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes for the Expert (Optional)</Label>
                    <Textarea 
                      id="notes" 
                      placeholder="Share your birth details or specific questions..."
                      className="min-h-[120px] rounded-lg border-slate-200 focus-visible:ring-indigo-500 resize-none"
                      {...form.register("notes")}
                    />
                  </div>

                  <div className="flex items-start space-x-3 pt-2">
                    <Checkbox 
                      id="terms" 
                      checked={form.watch("terms")}
                      onCheckedChange={(c) => form.setValue("terms", c === true)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="terms" className="text-sm font-medium text-slate-700">
                        I agree to the Terms of Service and Privacy Policy
                      </Label>
                      {form.formState.errors.terms && (
                        <p className="text-xs text-red-500">{form.formState.errors.terms.message}</p>
                      )}
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-14 mt-4 text-lg bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-500/25"
                    disabled={isBookingPending}
                  >
                    {isBookingPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Confirm Booking ($${expert.hourlyRate})`
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Summary */}
          <div className="lg:col-span-1">
            <Card className="border-none bg-indigo-50/50 rounded-2xl p-6 sticky top-24">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Booking Summary</h3>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shadow-md">
                    <img src={expert.profileImage || ""} alt={expert.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{expert.name}</p>
                    <p className="text-sm text-slate-600">{expert.category} Expert</p>
                  </div>
                </div>

                <div className="space-y-3 bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                  <div className="flex items-center gap-3 text-slate-700">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <span className="font-medium">{format(parseISO(date), "MMMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span className="font-medium">{time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="font-medium text-emerald-600">Video Consultation</span>
                  </div>
                </div>

                <Separator className="bg-indigo-200" />

                <div className="flex justify-between items-center text-lg font-bold text-slate-900">
                  <span>Total</span>
                  <span>${expert.hourlyRate}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
