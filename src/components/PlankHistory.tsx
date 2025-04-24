import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

export interface PlankEntry {
    id: number;
    date: string;  // e.g. "22 april"
    day: string;   // "Idag" | "Igår" | "Måndag" | …
    time: number;  // in seconds
}

interface PlankHistoryProps {
    onViewAll?: () => void;
}

const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
};

const PlankHistory: React.FC<PlankHistoryProps> = ({ onViewAll }) => {
    const [entries, setEntries] = useState<PlankEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function loadHistory() {
            setLoading(true);
            try {
                // 1) get current user
                const {
                    data: { user },
                    error: userErr,
                } = await supabase.auth.getUser();
                if (userErr || !user) throw userErr || new Error("No user");

                // 2) fetch last 5 planks
                const { data: rows, error } = await supabase
                    .from<{ id: number; plank_date: string; duration_s: number }>("planks")
                    .select("id, plank_date, duration_s")
                    .eq("user_id", user.id)
                    .order("plank_date", { ascending: false })
                    .limit(5);

                if (error) throw error;

                // 3) map into UI entries
                const mapped = (rows || []).map((r) => {
                    const d = new Date(r.plank_date);
                    const today = new Date();
                    const yesterday = new Date();
                    yesterday.setDate(today.getDate() - 1);

                    let dayLabel: string;
                    if (d.toDateString() === today.toDateString()) {
                        dayLabel = "Idag";
                    } else if (d.toDateString() === yesterday.toDateString()) {
                        dayLabel = "Igår";
                    } else {
                        const wd = d.toLocaleDateString("sv-SE", { weekday: "long" });
                        dayLabel = wd.charAt(0).toUpperCase() + wd.slice(1);
                    }

                    const dateDisplay = d.toLocaleDateString("sv-SE", {
                        day: "numeric",
                        month: "long",
                    });

                    return {
                        id: r.id,
                        date: dateDisplay,
                        day: dayLabel,
                        time: r.duration_s,
                    };
                });

                setEntries(mapped);
            } catch (err: any) {
                console.error(err);
                toast.error("Kunde inte ladda plankhistorik.");
            } finally {
                setLoading(false);
            }
        }

        loadHistory();
    }, []);

    if (loading) {
        return (
            <Card>
                <CardHeader className="border-b pb-3">
                    <CardTitle className="text-lg flex items-center">
                        <Clock className="h-5 w-5 text-plank-blue mr-2" />
                        Senaste Plankor
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-center">Laddar plankor…</CardContent>
            </Card>
        );
    }

    return (
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
};

export default PlankHistory;
