import './index.css';
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { SocketProvider } from "./context/SocketContext";
import { Footer } from "./components/layout/Footer"; // Add this
import NotFound from "./pages/not-found";
import Home from "./pages/Home";
import ExpertDetail from "./pages/ExpertDetail";
import Booking from "./pages/Booking";
import MyBookings from "./pages/MyBookings";
import Confirmation from "./pages/Confirmation";

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
        <SocketProvider>
          <div className="flex flex-col min-h-screen"> {/* Add this */}
            <Router />
            <Footer /> {/* Add this */}
          </div>
          <Toaster richColors position="top-right" />
        </SocketProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;