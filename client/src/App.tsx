import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import ExpertDetail from "@/pages/ExpertDetail";
import Booking from "@/pages/Booking";
import MyBookings from "@/pages/MyBookings";
import Confirmation from "@/pages/Confirmation";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/expert/:id" component={ExpertDetail} />
      <Route path="/booking/:expertId" component={Booking} />
      <Route path="/my-bookings" component={MyBookings} />
      <Route path="/confirmation/:id" component={Confirmation} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
