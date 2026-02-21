import { useState, useEffect } from "react";
import { useExperts } from "@/hooks/use-experts";
import { ExpertCard } from "@/components/experts/ExpertCard";
import { Header } from "@/components/layout/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useDebounce } from "@/hooks/useDebounce";
import { ExpertCardSkeleton } from "@/components/common/LoadingSkeleton";
import type { ExpertWithAvailability } from "@shared/schema";

interface PaginationInfo {
  page: number;
  pages: number;
  total: number;
  limit: number;
}

interface ExpertsResponse {
  data: ExpertWithAvailability[];
  pagination: PaginationInfo;
}

// Categories array
const categories = ['All', 'Astrology', 'Vastu', 'Numerology', 'Tarot'];

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  
  const { data, isLoading, isError, refetch } = useExperts({ 
    search: debouncedSearch, 
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    page
  });

  const experts = (data as ExpertsResponse | undefined)?.data || [];
  const pagination = (data as ExpertsResponse | undefined)?.pagination || { page: 1, pages: 1, total: 0, limit: 10 };

  useEffect(() => {
    refetch();
  }, [selectedCategory, refetch]);

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
        <div className="container mx-auto px-4 py-20 lg:py-28 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold mb-6 border border-indigo-100">
              <Sparkles className="w-4 h-4" />
              <span>Connect with Top Experts</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-slate-900 mb-6 leading-tight">
              Find Guidance for Your <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Life Journey</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Book real-time video sessions with verified experts in Astrology, Numerology, and more. Instant booking, secure payments.
            </p>
          </motion.div>

          {/* Search Box */}
          <motion.div 
            className="relative max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <Input
              type="text"
              placeholder="Search by name or keyword..."
              className="w-full pl-12 pr-4 h-14 rounded-2xl border-slate-200 shadow-xl shadow-indigo-500/5 text-lg focus-visible:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Category Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === 'All' ? 'all' : cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                (cat === 'All' && selectedCategory === 'all') || selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 ring-2 ring-offset-2 ring-indigo-600"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Experts Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {[...Array(8)].map((_, i) => (
              <ExpertCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-20 text-red-500">
            Failed to load experts. Please try again later.
          </div>
        ) : experts?.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-xl font-bold text-slate-900 mb-2">No experts found</h3>
            <p className="text-slate-500">Try adjusting your search or category filters.</p>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {experts.map((expert, index) => {
                // FIX: Use expert._id as key instead of expert.id
                const uniqueKey = expert._id || expert.id || `expert-${index}`;
                
                return (
                  <motion.div
                    key={uniqueKey}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <ExpertCard expert={expert} />
                  </motion.div>
                );
              })}
            </div>

            {pagination.pages > page && (
              <div className="text-center mt-8">
                <Button
                  onClick={loadMore}
                  disabled={isLoading}
                  className="px-8 h-12 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More Experts'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}