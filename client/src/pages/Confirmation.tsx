import { Link, useParams } from "wouter";
import { CheckCircle2, Home, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Confirmation() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center bg-white shadow-xl shadow-indigo-500/10 border-none rounded-3xl">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </motion.div>

        <h1 className="text-2xl font-display font-bold text-slate-900 mb-2">Booking Confirmed!</h1>
        <p className="text-slate-600 mb-8">
          Your session has been successfully booked. A confirmation email has been sent to your inbox.
        </p>

        <div className="bg-slate-50 rounded-xl p-4 mb-8 border border-slate-100">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Booking ID</p>
          <p className="text-lg font-mono font-bold text-slate-800">#{id}</p>
        </div>

        <div className="space-y-3">
          <Link href="/my-bookings">
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 shadow-lg shadow-indigo-500/20">
              <Calendar className="w-4 h-4 mr-2" />
              View My Bookings
            </Button>
          </Link>
          
          <Link href="/">
            <Button variant="outline" className="w-full rounded-xl h-12 border-slate-200 text-slate-600 hover:bg-slate-50">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
