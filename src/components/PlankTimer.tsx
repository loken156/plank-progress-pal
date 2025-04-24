import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, RotateCcw, CheckCircle } from "lucide-react";

interface StatsRow {
    current_streak: number;
    best_time_seconds: number | null;
    best_time_date: string | null;
    total_planks: number;
    monthly_rank: number | null;
    monthly_percentile: number | null;
}

const PlankTimer: React.FC = () => {
    const [seconds, setSeconds] = useState<number>(0);
    const [isActive, setIsActive] = useState<boolean>(false);
    const [isCompleted, setIsCompleted] = useState<boolean>(false);

    useEffect(() => {
        let interval: number;
        if (isActive) {
            interval = window.setInterval(() => {
                setSeconds((s) => s + 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive]);

    const formatTime = (totalSeconds: number): string => {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`;
    };

    const handleStart = (): void => {
        setIsActive(true);
        setIsCompleted(false);
    };

    const handlePause = (): void => {
        setIsActive(false);
    };

    const handleReset = (): void => {
        setSeconds(0);
        setIsActive(false);
        setIsCompleted(false);
    };

    const handleComplete = async (): Promise<void> => {
        setIsActive(false);

        // 1) Get current user
        const {
            data: { user },
            error: userErr,
        } = await supabase.auth.getUser();
        if (userErr || !user) {
            toast.error("Du måste vara inloggad för att spara plankan.");
            return;
        }

        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

        // 2) Insert plank record
        const { error: plankErr } = await supabase
            .from("planks")
            .insert({
                user_id: user.id,
                plank_date: today,
                duration_s: seconds,
            });
        if (plankErr) {
            console.error(plankErr);
            toast.error("Kunde inte spara plankan.");
            return;
        }

        // 3) Fetch existing stats (if any)
        const { data: oldStats, error: statsErr } = await supabase
            .from<StatsRow>("user_stats")
            .select("*")
            .eq("user_id", user.id)
            .single();

        if (statsErr && statsErr.code !== "PGRST116") {
            console.error(statsErr);
            toast.error("Kunde inte läsa dina statistik.");
            return;
        }

        // 4) Compute new values
        const prevStreak = oldStats?.current_streak ?? 0;
        let newStreak = 1;

        // check if user planked yesterday
        if (oldStats && prevStreak > 0) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yDate = yesterday.toISOString().split("T")[0];

            const { data: yEntry, error: yErr } = await supabase
                .from("planks")
                .select("plank_date")
                .eq("user_id", user.id)
                .eq("plank_date", yDate)
                .maybeSingle();

            if (yEntry) {
                newStreak = prevStreak + 1;
            }
        }

        const newTotal = (oldStats?.total_planks ?? 0) + 1;

        // best time?
        let bestSeconds = oldStats?.best_time_seconds ?? 0;
        let bestDate = oldStats?.best_time_date ?? null;
        if (seconds > bestSeconds) {
            bestSeconds = seconds;
            bestDate = today;
        }

        // 5) Upsert back into user_stats
        const { error: upsertErr } = await supabase
            .from("user_stats")
            .upsert(
                {
                    user_id: user.id,
                    current_streak: newStreak,
                    best_time_seconds: bestSeconds,
                    best_time_date: bestDate,
                    total_planks: newTotal,
                    monthly_rank: oldStats?.monthly_rank ?? null,
                    monthly_percentile: oldStats?.monthly_percentile ?? null,
                },
                { onConflict: "user_id" }
            );

        if (upsertErr) {
            console.error(upsertErr);
            toast.error("Kunde inte uppdatera din statistik.");
            return;
        }

        toast.success("Planka sparad!");
        setIsCompleted(true);
    };

    return (
        <Card className="plank-card w-full max-w-md mx-auto overflow-hidden">
            <div className="bg-gradient-to-r from-plank-blue to-plank-green p-4 text-white">
                <h2 className="text-xl font-bold font-poppins text-center">
                    Dagens Planka
                </h2>
            </div>
            <CardContent className="p-6">
                {isCompleted ? (
                    // Completed view…
                    <div className="text-center py-6 animate-fade-in">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-4">
                            <CheckCircle className="w-12 h-12 text-plank-green" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Bra jobbat!</h3>
                        <p className="text-gray-600 mb-4">
                            Du plankade i {formatTime(seconds)}
                        </p>
                        <Button className="plank-btn-outline" onClick={handleReset}>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Ny planka
                        </Button>
                    </div>
                ) : (
                    // Timer view…
                    <>
                        <div className="flex justify-center items-center my-8">
                            <div className="relative">
                                {isActive && (
                                    <span className="absolute inset-0 rounded-full animate-pulse-ring bg-plank-blue opacity-30" />
                                )}
                                <div
                                    className={`w-36 h-36 rounded-full flex items-center justify-center ${isActive ? "bg-plank-blue" : "bg-gray-100"
                                        }`}
                                >
                                    <span
                                        className={`text-3xl font-bold ${isActive ? "text-white" : "text-gray-700"
                                            }`}
                                    >
                                        {formatTime(seconds)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-3 mt-6">
                            {!isActive ? (
                                <Button
                                    className="plank-btn-primary flex-grow"
                                    onClick={handleStart}
                                >
                                    <Play className="mr-2 h-4 w-4" />
                                    Starta
                                </Button>
                            ) : (
                                <Button
                                    className="plank-btn-outline flex-grow"
                                    onClick={handlePause}
                                >
                                    <Pause className="mr-2 h-4 w-4" />
                                    Pausa
                                </Button>
                            )}

                            {seconds > 0 && (
                                <>
                                    <Button
                                        className="plank-btn-outline flex-grow"
                                        onClick={handleReset}
                                    >
                                        <RotateCcw className="mr-2 h-4 w-4" />
                                        Återställ
                                    </Button>

                                    {!isActive && (
                                        <Button
                                            className="plank-btn-secondary flex-grow"
                                            onClick={handleComplete}
                                        >
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Spara planka
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default PlankTimer;
