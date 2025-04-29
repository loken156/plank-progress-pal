// src/components/PlankTimer.tsx

import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, RotateCcw, CheckCircle } from "lucide-react";

const PlankTimer: React.FC = () => {
    const [mode, setMode] = useState<"stopwatch" | "timer">("stopwatch");
    const [seconds, setSeconds] = useState<number>(0);
    const [initialSeconds, setInitialSeconds] = useState<number>(0);
    const [inputMinutes, setInputMinutes] = useState<number>(0);
    const [inputSeconds, setInputSeconds] = useState<number>(0);
    const [isActive, setIsActive] = useState<boolean>(false);
    const [isCompleted, setIsCompleted] = useState<boolean>(false);
    const [vowCheat, setVowCheat] = useState<boolean>(false);

    // ticking for both modes
    useEffect(() => {
        let interval: number;
        if (isActive) {
            interval = window.setInterval(() => {
                setSeconds((s) => {
                    if (mode === "timer") {
                        if (s <= 1) {
                            clearInterval(interval);
                            handleComplete();
                            return 0;
                        }
                        return s - 1;
                    }
                    return s + 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, mode]);

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
        if (mode === "timer") {
            const total = inputMinutes * 60 + inputSeconds;
            if (total <= 0) {
                toast.error("Please set a positive timer duration.");
                return;
            }
            setInitialSeconds(total);
            setSeconds(total);
        } else {
            setSeconds(0);
        }
        setIsActive(true);
        setIsCompleted(false);
    };

    const handlePause = (): void => {
        setIsActive(false);
    };

    const handleReset = (): void => {
        setSeconds(0);
        setInputMinutes(0);
        setInputSeconds(0);
        setIsActive(false);
        setIsCompleted(false);
        setVowCheat(false);
    };

    const handleComplete = async (): Promise<void> => {
        const duration = mode === "timer" ? initialSeconds : seconds;
        setIsActive(false);
        setIsCompleted(true);
        setSeconds(duration);

        const {
            data: { user },
            error: userErr,
        } = await supabase.auth.getUser();
        if (userErr || !user) {
            toast.error("You must be logged in.");
            return;
        }

        const { error: plankErr } = await supabase
            .from("planks")
            .insert({
                user_id: user.id,
                duration_s: duration,
            });

        if (plankErr) {
            console.error(plankErr);
            toast.error("Could not save plank.");
            return;
        }

        toast.success("Plank saved!");
    };

    return (
        <Card className="plank-card w-full max-w-md mx-auto overflow-hidden">
            <div className="bg-gradient-to-r from-plank-blue to-plank-green p-4 text-white">
                <h2 className="text-xl font-bold font-poppins text-center">
                    Today's Plank
                </h2>
            </div>

            <CardContent className="p-6">
                {/* Tabs */}
                {!isCompleted && (
                    <div className="flex mb-4 border-b">
                        <button
                            onClick={() => !isActive && setMode("stopwatch")}
                            disabled={isActive}
                            className={`
                flex-1 py-2 text-center
                ${mode === "stopwatch"
                                    ? "border-b-2 border-white font-semibold"
                                    : "text-gray-500"}
                ${isActive ? "cursor-not-allowed opacity-50" : ""}
              `}
                        >
                            Stopwatch
                        </button>
                        <button
                            onClick={() => !isActive && setMode("timer")}
                            disabled={isActive}
                            className={`
                flex-1 py-2 text-center
                ${mode === "timer"
                                    ? "border-b-2 border-white font-semibold"
                                    : "text-gray-500"}
                ${isActive ? "cursor-not-allowed opacity-50" : ""}
              `}
                        >
                            Timer
                        </button>
                    </div>
                )}

                {isCompleted ? (
                    // Completed view
                    <div className="text-center py-6 animate-fade-in">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-4">
                            <CheckCircle className="w-12 h-12 text-plank-green" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Well done!</h3>
                        <p className="text-gray-600 mb-4">
                            You planked for{" "}
                            {formatTime(mode === "timer" ? initialSeconds : seconds)}
                        </p>
                        <Button
                            className="plank-btn-outline hover:text-white hover:scale-105"
                            onClick={handleReset}
                        >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            New plank
                        </Button>
                    </div>
                ) : mode === "stopwatch" ? (
                    // Stopwatch view
                    <>
                        {/* Circle */}
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

                        {/* Oath */}
                        {!isActive && (
                            <div className="flex items-center justify-center mb-4">
                                <input
                                    id="no-cheat"
                                    type="checkbox"
                                    className="h-4 w-4"
                                    checked={vowCheat}
                                    onChange={(e) => setVowCheat(e.target.checked)}
                                />
                                <label
                                    htmlFor="no-cheat"
                                    className="ml-2 text-sm text-gray-700"
                                >
                                    I solemnly swear my plank is real.
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
                ) : (
                    // Timer view
                    <>
                        {/* Inputs */}
                        {!isActive && (
                            <div className="flex justify-center mb-4 space-x-4">
                                <div className="text-center">
                                    <label className="block text-sm text-gray-700">Min</label>
                                    <input
                                        type="number"
                                        min={0}
                                        className="w-16 p-1 border rounded text-center"
                                        value={inputMinutes}
                                        onChange={(e) =>
                                            setInputMinutes(Number(e.target.value))
                                        }
                                    />
                                </div>
                                <div className="text-center">
                                    <label className="block text-sm text-gray-700">Sec</label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={59}
                                        className="w-16 p-1 border rounded text-center"
                                        value={inputSeconds}
                                        onChange={(e) =>
                                            setInputSeconds(Number(e.target.value))
                                        }
                                    />
                                </div>
                            </div>
                        )}

                        {/* Circle */}
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

                        {/* Oath */}
                        {!isActive && (
                            <div className="flex items-center justify-center mb-4">
                                <input
                                    id="no-cheat"
                                    type="checkbox"
                                    className="h-4 w-4"
                                    checked={vowCheat}
                                    onChange={(e) => setVowCheat(e.target.checked)}
                                />
                                <label
                                    htmlFor="no-cheat"
                                    className="ml-2 text-sm text-gray-700"
                                >
                                    I solemnly swear my plank is real.
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

                            {(inputMinutes > 0 || inputSeconds > 0) && !isActive && (
                                <Button
                                    className="plank-btn-outline flex-grow"
                                    onClick={handleReset}
                                >
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Reset
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default PlankTimer;
