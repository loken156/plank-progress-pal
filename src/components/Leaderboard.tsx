import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, TrendingUp } from "lucide-react";
import { toast } from "@/components/ui/sonner";

type LeaderboardEntry = {
    user_id: string;
    full_name: string;
    profile_image: string;
    best_time: number;
    rank: number;
};

const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
};

const Leaderboard: React.FC = () => {
    const [board, setBoard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            // 1) call our RPC
            const { data, error } = await supabase
                .rpc<LeaderboardEntry[]>("get_monthly_leaderboard");
            if (error) {
                console.error(error);
                toast.error("Could not load leaderboard.");
            } else {
                setBoard(data || []);
            }
            setLoading(false);
        }
        load();
    }, []);

    return (
        <Card className="plank-card">
            <CardHeader className="pb-2 border-b">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-poppins flex items-center">
                        <TrendingUp className="h-5 w-5 text-plank-blue mr-2" />
                        This Month’s Leaderboard
                    </CardTitle>
                    <button className="text-sm text-plank-blue flex items-center">
                        <UserPlus className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Find Friends</span>
                    </button>
                </div>
            </CardHeader>

            {loading ? (
                <CardContent className="p-6 text-center text-gray-500">
                    Loading leaderboard…
                </CardContent>
            ) : (
                <CardContent className="p-0">
                    <ul className="divide-y">
                        {board.map((entry) => (
                            <li
                                key={entry.user_id}
                                className="flex items-center p-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="w-8 text-center font-bold text-gray-500">
                                    {entry.rank}
                                </div>
                                <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                                    <img
                                        src={entry.profile_image}
                                        alt={entry.full_name}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium">{entry.full_name}</h3>
                                </div>
                                <div className="text-right">
                                    <span className="font-semibold">
                                        {formatTime(entry.best_time)}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="p-4 text-center border-t">
                        <button className="text-plank-blue font-medium hover:underline">
                            View All
                        </button>
                    </div>
                </CardContent>
            )}
        </Card>
    );
};

export default Leaderboard;
