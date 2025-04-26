// src/components/Leaderboard.tsx

import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { UserPlus, TrendingUp } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";

type MonthlyEntry = {
    user_id: string;
    full_name: string;
    profile_image: string;
    best_time: number;
    rank: number;
};

type TotalEntry = {
    user_id: string;
    full_name: string;
    profile_image: string;
    total_time: number;
    rank: number;
};

const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
};

const Leaderboard: React.FC = () => {
    const [monthly, setMonthly] = useState<MonthlyEntry[]>([]);
    const [total, setTotal] = useState<TotalEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function loadAll() {
            setLoading(true);

            // 1) monthly best single plank
            const { data: mdata, error: mErr } = await supabase
                .rpc<MonthlyEntry[]>("get_monthly_best_time_leaderboard");
            if (mErr) {
                console.error(mErr);
                toast.error("Could not load monthly leaderboard.");
            } else {
                setMonthly(mdata || []);
            }

            // 2) all-time total plank time
            const { data: tdata, error: tErr } = await supabase
                .rpc<TotalEntry[]>("get_monthly_total_time_leaderboard");

            if (tErr) {
                console.error(tErr);
                toast.error("Could not load total-time leaderboard.");
            } else {
                setTotal(tdata || []);
            }

            setLoading(false);
        }

        loadAll();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="plank-card"><CardContent className="p-6 text-center">Loading…</CardContent></Card>
                <Card className="plank-card"><CardContent className="p-6 text-center">Loading…</CardContent></Card>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Monthly best */}
            <Card className="plank-card">
                <CardHeader className="pb-2 border-b flex items-center justify-between">
                    <CardTitle className="text-lg font-poppins flex items-center">
                        <TrendingUp className="h-5 w-5 text-plank-blue mr-2" />
                        This Month’s Best
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <ul className="divide-y">
                        {monthly.map((e) => (
                            <li
                                key={e.user_id}
                                className="cursor-pointer flex items-center p-4 hover:bg-gray-50 transition-colors"
                                onClick={() => navigate(`/profile/${e.user_id}`)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(ev) => ev.key === "Enter" && navigate(`/profile/${e.user_id}`)}
                            >
                                <div className="w-8 text-center font-bold text-gray-500">{e.rank}</div>
                                <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                                    <img
                                        src={e.profile_image}
                                        alt={e.full_name}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium">{e.full_name}</h3>
                                </div>
                                <div className="text-right font-semibold">
                                    {formatTime(e.best_time)}
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
            </Card>

            {/* All-time total */}
            <Card className="plank-card">
                <CardHeader className="pb-2 border-b flex items-center justify-between">
                    <CardTitle className="text-lg font-poppins flex items-center">
                        <TrendingUp className="h-5 w-5 text-plank-green mr-2" />
                        This Month's Total
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <ul className="divide-y">
                        {total.map((e) => (
                            <li
                                key={e.user_id}
                                className="cursor-pointer flex items-center p-4 hover:bg-gray-50 transition-colors"
                                onClick={() => navigate(`/profile/${e.user_id}`)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(ev) => ev.key === "Enter" && navigate(`/profile/${e.user_id}`)}
                            >
                                <div className="w-8 text-center font-bold text-gray-500">{e.rank}</div>
                                <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                                    <img
                                        src={e.profile_image}
                                        alt={e.full_name}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium">{e.full_name}</h3>
                                </div>
                                <div className="text-right font-semibold">
                                    {formatTime(e.total_time)}
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="p-4 text-center border-t">
                        <button className="text-plank-green font-medium hover:underline">
                            View All
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Leaderboard;
