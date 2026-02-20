import { Link, useLocation } from "wouter";
import { Sparkles, Calendar, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const [location] = useLocation();

  const navItems = [
    { label: "Find Experts", href: "/", icon: Search },
    { label: "My Bookings", href: "/my-bookings", icon: Calendar },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-indigo-600 rounded-lg group-hover:bg-indigo-700 transition-colors">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-slate-900 tracking-tight">
            Expert<span className="text-indigo-600">Sync</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-4">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer",
                  location === item.href
                    ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
