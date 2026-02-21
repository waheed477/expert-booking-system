import { Link, useLocation } from "wouter";
import { Star, Clock, Trophy, Calendar, MessageCircle } from "lucide-react";
import { type ExpertWithAvailability } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface ExpertCardProps {
  expert: ExpertWithAvailability;
}

export function ExpertCard({ expert }: ExpertCardProps) {
  const [, setLocation] = useLocation();
  
  // Convert rating stored as int (e.g. 48) to float (4.8)
  const rating = (expert.rating / 10).toFixed(1);

  const handleViewProfile = () => {
    const encodedId = encodeURIComponent(expert._id);
    setLocation(`/expert/${encodedId}`);
  };

  return (
    <div className="cursor-pointer h-full" onClick={handleViewProfile}>
      <Card className="group h-full overflow-hidden border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xl transition-all duration-300 flex flex-col rounded-xl">
        {/* Header with fixed height */}
        <div className="relative h-20 bg-gradient-to-r from-indigo-600 to-purple-600 flex-shrink-0">
          <div className="absolute -bottom-8 left-4">
            <Avatar className="w-16 h-16 border-3 border-white shadow-md">
              <AvatarImage src={expert.profileImage || ""} alt={expert.name} className="object-cover" />
              <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xl font-bold">
                {expert.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        <CardContent className="pt-8 px-4 pb-2 flex-grow">
          {/* Name and Rating */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-slate-900 truncate">
                {expert.name}
              </h3>
              <p className="text-xs text-indigo-600 font-medium">{expert.category}</p>
            </div>
            <div className="flex items-center gap-0.5 bg-amber-50 px-1.5 py-1 rounded-md flex-shrink-0 ml-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-amber-700">{rating}</span>
            </div>
          </div>

          {/* Bio - exactly 2 lines */}
          <p className="text-xs text-slate-600 line-clamp-2 mb-2 leading-relaxed">
            {expert.bio}
          </p>

          {/* Languages - compact */}
          <div className="flex flex-wrap gap-1 mb-2">
            {(expert.languages as string[]).slice(0, 2).map((lang) => (
              <Badge key={lang} className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0 h-4">
                {lang}
              </Badge>
            ))}
            {(expert.languages as string[]).length > 2 && (
              <Badge className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0 h-4">
                +{(expert.languages as string[]).length - 2}
              </Badge>
            )}
          </div>

          {/* Stats - compact row */}
          <div className="flex items-center justify-between text-slate-600 bg-slate-50 p-2 rounded-lg text-xs">
            <div className="flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>{expert.experience} yrs</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>{expert.totalReviews} sessions</span>
            </div>
            <div className="font-bold text-indigo-600">${expert.hourlyRate}</div>
          </div>
        </CardContent>

        <CardFooter className="px-4 py-2 border-t border-slate-100 flex-shrink-0">
          <Button 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-1.5 h-auto rounded-lg"
            onClick={(e) => {
              e.stopPropagation();
              const encodedId = encodeURIComponent(expert._id);
              setLocation(`/expert/${encodedId}`);
            }}
          >
            View Profile
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}