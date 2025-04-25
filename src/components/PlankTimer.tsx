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
    const [vowCheat, setVowCheat] = useState<boolean>(false);

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
        if (!vowCheat) {
            toast.error("You must swear you won’t cheat before you start!");
            return;
        }
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
        setVowCheat(false); // clear the oath for the next round
    };

    const handleComplete = async (): Promise<void> => {
        setIsActive(false);

        const {
            data: { user },
            error: userErr,
        } = await supabase.auth.getUser();
        if (userErr || !user) {
            toast.error("You must be logged in.");
            return;
        }

        // only insert the plank; trigger will maintain stats
        const { error: plankErr } = await supabase
            .from("planks")
            .insert({
                user_id: user.id,
                duration_s: seconds,
            });

        if (plankErr) {
            console.error(plankErr);
            toast.error("Could not save plank.");
            return;
        }

        toast.success("Plank saved!");
        setIsCompleted(true);
    };

    return (
        <Card className="plank-card w-full max-w-md mx-auto overflow-hidden">
            <div className="bg-gradient-to-r from-plank-blue to-plank-green p-4 text-white">
                <h2 className="text-xl font-bold font-poppins text-center">
                    Today's Plank
                </h2>
            </div>
            <CardContent className="p-6">
                {isCompleted ? (
                    // Completed view…
                    <div className="text-center py-6 animate-fade-in">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-4">
                            <CheckCircle className="w-12 h-12 text-plank-green" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Well done!</h3>
                        <p className="text-gray-600 mb-4">
                            You planked for {formatTime(seconds)}
                        </p>
                        <Button
                            className="plank-btn-outline hover:text-white hover:scale-105"
                            onClick={handleReset}
                        >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            New plank
                        </Button>
                    </div>
                ) : (
                    // Timer view…
                    <>
                        {/* Timer circle */}
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

                        {/* No-cheating checkbox */}
                        {!isActive && (
                            <div className="flex items-center justify-center mb-4">
                                <input
                                    id="no-cheat"
                                    type="checkbox"
                                    className="h-4 w-4"
                                    checked={vowCheat}
                                    onChange={(e) => setVowCheat(e.target.checked)}
                                />
                                <label htmlFor="no-cheat" className="ml-2 text-sm text-gray-700">
                                    I solemnly swear my plank be real.
                                </label>
                            </div>
                        )}

                        {/* Controls */}
                        <div className="flex flex-wrap justify-center gap-3 mt-6">
                            {!isActive ? (
                                <Button
                                    className="plank-btn-primary flex-grow"
                                    onClick={handleStart}
                                >
                                    <Play className="mr-2 h-4 w-4" />
                                    Start
                                </Button>
                            ) : (
                                <Button
                                    className="plank-btn-outline flex-grow"
                                    onClick={handlePause}
                                >
                                    <Pause className="mr-2 h-4 w-4" />
                                    Pause
                                </Button>
                            )}

                            {seconds > 0 && (
                                <>
                                    <Button
                                        className="plank-btn-outline flex-grow"
                                        onClick={handleReset}
                                    >
                                        <RotateCcw className="mr-2 h-4 w-4" />
                                        Reset
                                    </Button>
                                    {!isActive && (
                                        <Button
                                            className="plank-btn-secondary flex-grow"
                                            onClick={handleComplete}
                                        >
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Save plank
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
