
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  Calendar,
  CalendarCheck,
  Clock
} from "lucide-react";

const UserStats = () => {
  // Mock data - in a real app this would come from API/database
  const stats = {
    streak: 7,
    bestTime: 180, // in seconds
    totalPlanks: 42,
    monthlyRank: 12
  };

  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
      <Card className="plank-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <CalendarCheck className="h-4 w-4 text-plank-blue mr-2" />
            Nuvarande Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.streak} dagar</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.streak > 5 ? 'Imponerande streak!' : 'Fortsätt så!'}
          </p>
        </CardContent>
      </Card>

      <Card className="plank-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <Clock className="h-4 w-4 text-plank-green mr-2" />
            Bästa Tid
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatTime(stats.bestTime)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Uppnådd den 22 april
          </p>
        </CardContent>
      </Card>

      <Card className="plank-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <Calendar className="h-4 w-4 text-plank-blue mr-2" />
            Totala Plankor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPlanks}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Sedan du började
          </p>
        </CardContent>
      </Card>

      <Card className="plank-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <TrendingUp className="h-4 w-4 text-plank-green mr-2" />
            Månadens Ranking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">#{stats.monthlyRank}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Inom topp 5%
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserStats;
