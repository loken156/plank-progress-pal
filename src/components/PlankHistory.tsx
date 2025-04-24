import React from "react";
import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface PlankEntry {
  id: number;
  date: string;
  day: string;
  time: number;
}

interface PlankHistoryProps {
  entries: PlankEntry[];
  onViewAll?: () => void;
}

const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

const PlankHistory: React.FC<PlankHistoryProps> = ({ entries, onViewAll }) => (
  <Card>
    <CardHeader className="border-b pb-3">
      <CardTitle className="text-lg flex items-center">
        <Clock className="h-5 w-5 text-plank-blue mr-2" />
        Senaste Plankor
      </CardTitle>
    </CardHeader>
    <CardContent className="p-0">
      <ul className="divide-y">
        {entries.map((e) => (
          <li
            key={e.id}
            className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div>
              <p className="font-medium">{e.day}</p>
              <p className="text-sm text-gray-500">{e.date}</p>
            </div>
            <div className="flex items-center">
              <div className="h-8 w-8 bg-plank-light-blue rounded-full flex items-center justify-center mr-3">
                <Clock className="h-4 w-4 text-plank-blue" />
              </div>
              <span className="font-semibold">{formatTime(e.time)}</span>
            </div>
          </li>
        ))}
      </ul>
      {onViewAll && (
        <div className="p-4 border-t text-center">
          <button
            className="text-plank-blue font-medium hover:underline"
            onClick={onViewAll}
          >
            Visa hela historiken
          </button>
        </div>
      )}
    </CardContent>
  </Card>
);

export default PlankHistory;
