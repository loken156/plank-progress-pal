import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, Clock, Calendar, TrendingUp } from "lucide-react";

interface UserStatsRow {
    current_streak: number;
    best_time_seconds: number | null;
    best_time_date: string | null;
    total_planks: number;
    monthly_rank: number | null;
    monthly_percentile: number | null;
}

const UserStats: React.FC = () => {
    const [stats, setStats] = useState<UserStatsRow | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                // 1) Get current user
                const {
                    data: { user },
                    error: userErr,
                } = await supabase.auth.getUser();
                if (userErr || !user) throw userErr || new Error("No user");

                // 2) Fetch stats row
                const { data, error } = await supabase
                    .from<UserStatsRow>("user_stats")
                    .select("*")
                    .eq("user_id", user.id)
                    .single();

                if (error && error.code !== "PGRST116") {
                    // PGRST116 = no rows found
                    throw error;
                }

                setStats(data);
            } catch (err: any) {
                console.error(err);
                toast.error("Could not load statistics.");
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    if (loading) {
        return <div className="text-center py-8">Loading statistics…</div>;
    }

    // If no stats row yet, show placeholders
    const {
        current_streak = 0,
        best_time_seconds = 0,
        best_time_date,
        total_planks = 0,
        monthly_rank = 0,
        monthly_percentile = 0,
    } = stats || {};

    const formatTime = (totalSeconds: number): string => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
    };

    const formattedBestDate = best_time_date
        ? new Date(best_time_date).toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
        })
        : "–";

    const percentileText =
        monthly_percentile !== null
            ? `Within top ${monthly_percentile.toFixed(0)}%`
            : "–";

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
            {/* Current Streak */}
            <Card className="plank-card">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                        <CalendarCheck className="h-4 w-4 text-plank-blue mr-2" />
                        Current Streak
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{current_streak} days</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {current_streak > 5 ? "Impressive streak!" : "Keep it up!"}
                    </p>
                </CardContent>
            </Card>

            {/* Best Time */}
            <Card className="plank-card">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                        <Clock className="h-4 w-4 text-plank-green mr-2" />
                        Best Time
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {formatTime(best_time_seconds)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Achieved on {formattedBestDate}
                    </p>
                </CardContent>
            </Card>

            {/* Total Planks */}
            <Card className="plank-card">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                        <Calendar className="h-4 w-4 text-plank-blue mr-2" />
                        Total Planks
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{total_planks}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Since you started
                    </p>
                </CardContent>
            </Card>

            {/* Monthly Ranking */}
            <Card className="plank-card">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                        <TrendingUp className="h-4 w-4 text-plank-green mr-2" />
                        Monthly Ranking
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">#{monthly_rank}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {percentileText}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default UserStats;
