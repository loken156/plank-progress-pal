
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Badge = {
  id: number;
  name: string;
  icon: string;
  description: string;
  achieved: boolean;
  date?: string;
  progress?: number;
};

const AchievementBadges = () => {
  // Mock data - in a real app this would come from API/database
  const badges: Badge[] = [
    { id: 1, name: "Nybörjare", icon: "🎯", description: "Genomför din första planka", achieved: true, date: "10 april 2024" },
    { id: 2, name: "En Veckas Streak", icon: "🔥", description: "Planka 7 dagar i rad", achieved: true, date: "17 april 2024" },
    { id: 3, name: "3-Minuters Mästare", icon: "⏱️", description: "Håll en planka i 3 minuter", achieved: true, date: "22 april 2024" },
    { id: 4, name: "Social Plankare", icon: "👥", description: "Lägg till 3 vänner", achieved: false, progress: 1 },
    { id: 5, name: "Månadens Topp 10", icon: "🏆", description: "Nå topp 10 i månadens ranking", achieved: false },
    { id: 6, name: "Plank Veteran", icon: "⭐", description: "Genomför 50 plankor", achieved: false, progress: 42 },
  ];

  return (
    <Card className="plank-card">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-lg font-poppins">
          Prestationer och Utmärkelser
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          <TooltipProvider delayDuration={300}>
            {badges.map((badge) => (
              <Tooltip key={badge.id}>
                <TooltipTrigger asChild>
                  <div className={`aspect-square rounded-lg flex flex-col items-center justify-center p-2 cursor-pointer border-2 transition-all ${badge.achieved ? 'border-plank-green bg-green-50' : 'border-dashed border-gray-300'}`}>
                    <div className="text-3xl mb-1">{badge.icon}</div>
                    <span className={`text-xs font-medium text-center ${badge.achieved ? 'text-plank-green' : 'text-gray-500'}`}>
                      {badge.name}
                    </span>
                    {!badge.achieved && badge.progress && (
                      <div className="w-full h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
                        <div 
                          className="h-full bg-plank-blue" 
                          style={{ width: `${(badge.progress / 50) * 100}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <div className="text-sm p-1">
                    <p className="font-semibold">{badge.name}</p>
                    <p className="text-xs text-gray-500">{badge.description}</p>
                    {badge.achieved && (
                      <p className="text-xs text-plank-green mt-1">Uppnådd: {badge.date}</p>
                    )}
                    {!badge.achieved && badge.progress && (
                      <p className="text-xs text-gray-500 mt-1">Progress: {badge.progress}/50</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementBadges;
