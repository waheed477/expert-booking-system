import { Link } from "wouter";
import { Star, Clock, Trophy } from "lucide-react";
import { type ExpertWithAvailability } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ExpertCardProps {
  expert: ExpertWithAvailability;
}

export function ExpertCard({ expert }: ExpertCardProps) {
  // Convert rating stored as int (e.g. 48) to float (4.8)
  const rating = (expert.rating / 10).toFixed(1);

  return (
    <Link href={`/expert/${expert.id}`}>
      <Card className="group h-full overflow-hidden border-slate-200 bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer flex flex-col">
        <CardHeader className="p-0">
          <div className="h-24 bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -bottom-8 left-6">
              <Avatar className="w-20 h-20 border-4 border-white shadow-md">
                <AvatarImage src={expert.profileImage || ""} alt={expert.name} />
                <AvatarFallback className="bg-slate-100 text-slate-500 text-xl font-bold">
                  {expert.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-10 px-6 pb-4 flex-grow">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {expert.name}
              </h3>
              <p className="text-sm font-medium text-slate-500">{expert.category}</p>
            </div>
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-amber-700">{rating}</span>
            </div>
          </div>

          <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
            {expert.bio}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {(expert.languages as string[]).slice(0, 3).map((lang) => (
              <Badge key={lang} variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none font-normal text-xs">
                {lang}
              </Badge>
            ))}
          </div>
        </CardContent>

        <CardFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-sm">
          <div className="flex items-center gap-4 text-slate-600">
            <div className="flex items-center gap-1.5" title="Experience">
              <Trophy className="w-4 h-4 text-indigo-500" />
              <span className="font-medium">{expert.experience} Yrs</span>
            </div>
            <div className="flex items-center gap-1.5" title="Reviews">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span className="font-medium">{expert.totalReviews} sessions</span>
            </div>
          </div>
          <div className="font-display font-bold text-slate-900">
            ${expert.hourlyRate}<span className="text-slate-500 font-sans text-xs font-normal">/hr</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
