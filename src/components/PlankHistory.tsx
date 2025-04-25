import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";

export interface PlankEntry {
    id: number;
    date: string;  // e.g. "April 22"
    day: string;   // "Today" | "Yesterday" | "Monday" | …
    time: number;  // seconds
}

interface PlankHistoryProps {
    userId: string;
}

const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
};

const PlankHistory: React.FC<PlankHistoryProps> = ({ userId }) => {
    const [recent, setRecent] = useState<PlankEntry[]>([]);
    const [loadingRecent, setLoadingRecent] = useState(true);

    const [allEntries, setAllEntries] = useState<PlankEntry[]>([]);
    const [loadingAll, setLoadingAll] = useState(false);

    // load latest 5 planks
    useEffect(() => {
        async function loadRecent() {
            setLoadingRecent(true);
            try {
                const { data: rows, error } = await supabase
                    .from<{ id: number; plank_date: string; duration_s: number }>(
                        "planks"
                    )
                    .select("id, plank_date, duration_s")
                    .eq("user_id", userId)
                    .order("plank_date", { ascending: false })
                    .limit(5);

                if (error) throw error;

                setRecent(
                    (rows || []).map((r) => {
                        const d = new Date(r.plank_date);
                        const today = new Date();
                        const yesterday = new Date();
                        yesterday.setDate(today.getDate() - 1);

                        let dayLabel: string;
                        if (d.toDateString() === today.toDateString()) {
                            dayLabel = "Today";
                        } else if (d.toDateString() === yesterday.toDateString()) {
                            dayLabel = "Yesterday";
                        } else {
                            const wd = d.toLocaleDateString("en-US", { weekday: "long" });
                            dayLabel = wd.charAt(0).toUpperCase() + wd.slice(1);
                        }

                        return {
                            id: r.id,
                            date: d.toLocaleDateString("en-US", {
                                day: "numeric",
                                month: "long",
                            }),
                            day: dayLabel,
                            time: r.duration_s,
                        };
                    })
                );
            } catch (err: any) {
                console.error(err);
                toast.error("Could not load plank history.");
            } finally {
                setLoadingRecent(false);
            }
        }

        loadRecent();
    }, [userId]);

    // load all planks (for modal)
    const loadAll = async () => {
        setLoadingAll(true);
        try {
            const { data: rows, error } = await supabase
                .from<{ id: number; plank_date: string; duration_s: number }>(
                    "planks"
                )
                .select("id, plank_date, duration_s")
                .eq("user_id", userId)
                .order("plank_date", { ascending: false });

            if (error) throw error;

            setAllEntries(
                (rows || []).map((r) => {
                    const d = new Date(r.plank_date);
                    const today = new Date();
                    const yesterday = new Date();
                    yesterday.setDate(today.getDate() - 1);

                    let dayLabel: string;
                    if (d.toDateString() === today.toDateString()) {
                        dayLabel = "Today";
                    } else if (d.toDateString() === yesterday.toDateString()) {
                        dayLabel = "Yesterday";
                    } else {
                        const wd = d.toLocaleDateString("en-US", { weekday: "long" });
                        dayLabel = wd.charAt(0).toUpperCase() + wd.slice(1);
                    }

                    return {
                        id: r.id,
                        date: d.toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "long",
                        }),
                        day: dayLabel,
                        time: r.duration_s,
                    };
                })
            );
        } catch (err: any) {
            console.error(err);
            toast.error("Could not load full history.");
        } finally {
            setLoadingAll(false);
        }
    };

    return (
        <>
            <Card>
                <CardHeader className="border-b pb-3">
                    <CardTitle className="text-lg flex items-center">
                        <Clock className="h-5 w-5 text-plank-blue mr-2" />
                        Latest Planks
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loadingRecent ? (
                        <div className="p-6 text-center text-gray-500">
                            Loading planks…
                        </div>
                    ) : (
                        <ul className="divide-y">
                            {recent.map((e) => (
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
                    )}
                    <div className="p-4 border-t text-center">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    variant="link"
                                    onClick={loadAll}
                                    className="text-plank-blue text-md font-medium hover:underline"
                                >
                                    View full history
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg w-full">
                                <DialogHeader>
                                    <DialogTitle>Full Plank History</DialogTitle>
                                    <DialogClose />
                                </DialogHeader>
                                <div className="h-80 overflow-y-auto divide-y">
                                    {loadingAll ? (
                                        <p className="p-6 text-center text-gray-500">
                                            Loading…
                                        </p>
                                    ) : (
                                        allEntries.map((e) => (
                                            <div
                                                key={e.id}
                                                className="p-4 flex items-center justify-between"
                                            >
                                                <div>
                                                    <p className="font-medium">{e.day}</p>
                                                    <p className="text-sm text-gray-500">{e.date}</p>
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 bg-plank-light-blue rounded-full flex items-center justify-center mr-3">
                                                        <Clock className="h-4 w-4 text-plank-blue" />
                                                    </div>
                                                    <span className="font-semibold">
                                                        {formatTime(e.time)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>
        </>
    );
};

export default PlankHistory;
