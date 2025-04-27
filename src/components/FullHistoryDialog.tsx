// src/components/FullHistoryDialog.tsx

import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { Clock, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export interface PlankEntry {
    id: number;
    date: string;   // e.g. "April 22"
    day: string;    // "Today" | "Yesterday" | "Monday" | …
    time: number;   // seconds
}

interface FullHistoryDialogProps {
    userId: string;
    trigger: React.ReactNode;
}

const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
};

const FullHistoryDialog: React.FC<FullHistoryDialogProps> = ({ userId, trigger }) => {
    const { user } = useAuth();
    const [entries, setEntries] = useState<PlankEntry[]>([]);
    const [loading, setLoading] = useState(false);

    // load full history
    const loadAll = async () => {
        setLoading(true);
        try {
            const { data: rows, error } = await supabase
                .from<{ id: number; plank_date: string; duration_s: number; inserted_at: string }>("planks")
                .select("id, plank_date, duration_s, inserted_at")
                .eq("user_id", userId)
                .order("inserted_at", { ascending: false });

            if (error) throw error;

            setEntries(
                (rows || []).map(r => {
                    const d = new Date(r.plank_date);
                    const today = new Date();
                    const yesterday = new Date(today);
                    yesterday.setDate(today.getDate() - 1);

                    let dayLabel: string;
                    if (d.toDateString() === today.toDateString()) dayLabel = "Today";
                    else if (d.toDateString() === yesterday.toDateString()) dayLabel = "Yesterday";
                    else {
                        const wd = d.toLocaleDateString("en-US", { weekday: "long" });
                        dayLabel = wd.charAt(0).toUpperCase() + wd.slice(1);
                    }

                    return {
                        id: r.id,
                        date: d.toLocaleDateString("en-US", { day: "numeric", month: "long" }),
                        day: dayLabel,
                        time: r.duration_s,
                    };
                })
            );
        } catch (err: any) {
            console.error(err);
            toast.error("Could not load full history.");
        } finally {
            setLoading(false);
        }
    };

    // delete a plank
    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this plank?")) return;
        try {
            await supabase.from("planks").delete().eq("id", id);
            toast.success("Plank deleted");
            loadAll();
        } catch (err: any) {
            console.error(err);
            toast.error("Failed to delete plank.");
        }
    };

    const isOwnProfile = user?.id === userId;

    return (
        <Dialog
            onOpenChange={(open) => {
                if (open) loadAll();
            }}
        >
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-lg w-full">
                <DialogHeader>
                    <DialogTitle>Full Plank History</DialogTitle>
                    <DialogClose />
                </DialogHeader>
                <div className="h-80 overflow-y-auto divide-y">
                    {loading ? (
                        <p className="p-6 text-center text-gray-500">Loading…</p>
                    ) : (
                        entries.map((e) => (
                            <div
                                key={e.id}
                                className="p-4 flex items-center justify-between"
                            >
                                <div>
                                    <p className="font-medium">{e.day}</p>
                                    <p className="text-sm text-gray-500">{e.date}</p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="h-8 w-8 bg-plank-light-blue rounded-full flex items-center justify-center">
                                        <Clock className="h-4 w-4 text-plank-blue" />
                                    </div>
                                    <span className="font-semibold">{formatTime(e.time)}</span>
                                    {isOwnProfile && (
                                        <button
                                            onClick={() => handleDelete(e.id)}
                                            aria-label="Delete plank"
                                            className="p-1 hover:bg-red-100 rounded"
                                        >
                                            <Trash2 className="h-5 w-5 text-red-500" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default FullHistoryDialog;
