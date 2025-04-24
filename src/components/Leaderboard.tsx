
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  UserPlus,
  TrendingUp 
} from "lucide-react";

type LeaderboardEntry = {
  id: number;
  name: string;
  profileImage: string;
  time: number;
  rank: number;
};

const Leaderboard = () => {
  // Mock data - in a real app this would come from API/database
  const leaderboardData: LeaderboardEntry[] = [
    { id: 1, name: "Erik Andersson", profileImage: "https://i.pravatar.cc/150?img=11", time: 300, rank: 1 },
    { id: 2, name: "Sofia Berg", profileImage: "https://i.pravatar.cc/150?img=5", time: 285, rank: 2 },
    { id: 3, name: "Johan Nilsson", profileImage: "https://i.pravatar.cc/150?img=12", time: 270, rank: 3 },
    { id: 4, name: "Anna Lindberg", profileImage: "https://i.pravatar.cc/150?img=9", time: 255, rank: 4 },
    { id: 5, name: "Karl Svensson", profileImage: "https://i.pravatar.cc/150?img=15", time: 240, rank: 5 },
  ];

  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  };

  return (
    <Card className="plank-card">
      <CardHeader className="pb-2 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-poppins flex items-center">
            <TrendingUp className="h-5 w-5 text-plank-blue mr-2" />
            Månadens Topplista
          </CardTitle>
          <button className="text-sm text-plank-blue flex items-center">
            <UserPlus className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Hitta vänner</span>
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y">
          {leaderboardData.map((entry) => (
            <li key={entry.id} className="flex items-center p-4 hover:bg-gray-50 transition-colors">
              <div className="w-8 text-center font-bold text-gray-500">
                {entry.rank}
              </div>
              <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                <img 
                  src={entry.profileImage} 
                  alt={entry.name} 
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{entry.name}</h3>
              </div>
              <div className="text-right">
                <span className="font-semibold">{formatTime(entry.time)}</span>
              </div>
            </li>
          ))}
        </ul>
        <div className="p-4 text-center border-t">
          <button className="text-plank-blue font-medium hover:underline">
            Visa alla
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
