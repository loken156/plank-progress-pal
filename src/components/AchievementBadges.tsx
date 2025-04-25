import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/components/ui/sonner";

type BadgeRow = {
    id: number;
    name: string;
    icon_url: string;
    description: string;
    criteria: { [key: string]: any };
    user_badges: {
        progress: number;
        max_progress: number;
        earned_at: string | null;
    } | null;
};

const AchievementBadges: React.FC = () => {
    const [badges, setBadges] = useState<BadgeRow[]>([]);
    const [loading, setLoading] = useState(true);

    const loadBadges = useCallback(async () => {
        setLoading(true);
        const {
            data: { user },
            error: userErr,
        } = await supabase.auth.getUser();
        if (userErr || !user) {
            toast.error("No user");
            setLoading(false);
            return;
        }

        const { data, error } = await supabase
            .from<BadgeRow>("badges")
            .select(`
                id,
                name,
                icon_url,
                description,
                criteria,
                user_badges!inner (
                    progress,
                    max_progress,
                    earned_at,
                    user_id
                )
            `)
            .eq("user_badges.user_id", user.id);

        if (error) {
            toast.error("Could not load badges");
        } else {
            setBadges(data || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        let chan: ReturnType<typeof supabase["channel"]>;

        (async () => {
            await loadBadges();

            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            // subscribe to any changes on user_badges for this user
            chan = supabase
                .channel("user_badges_changes")
                .on(
                    "postgres_changes",
                    {
                        event: "*",
                        schema: "public",
                        table: "user_badges",
                        filter: `user_id=eq.${user.id}`,
                    },
                    () => {
                        loadBadges();
                    }
                )
                .subscribe();
        })();

        return () => {
            if (chan) {
                supabase.removeChannel(chan);
            }
        };
    }, [loadBadges]);

    if (loading) {
        return <div className="text-center py-6">Loading achievements…</div>;
    }

    return (
        <Card className="plank-card">
            <CardHeader className="pb-2 border-b">
                <CardTitle className="text-lg font-poppins">
                    Achievements and Awards
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                    <TooltipProvider delayDuration={300}>
                        {badges.map((b) => {
                            const ub = b.user_badges!;
                            const achieved = Boolean(ub.earned_at);
                            const pct = ub.max_progress
                                ? Math.min(100, (ub.progress / ub.max_progress) * 100)
                                : 0;

                            return (
                                <Tooltip key={b.id}>
                                    <TooltipTrigger asChild>
                                        <div
                                            className={`aspect-square rounded-lg flex flex-col items-center justify-center p-2 cursor-pointer border-2 transition-all ${achieved
                                                    ? "border-plank-green bg-green-50"
                                                    : "border-dashed border-gray-300"
                                                }`}
                                        >
                                            <div className="text-3xl mb-1">{b.icon_url}</div>
                                            <span
                                                className={`text-xs font-medium text-center ${achieved ? "text-plank-green" : "text-gray-500"
                                                    }`}
                                            >
                                                {b.name}
                                            </span>

                                            {/* show bar for any badge with a max_progress */}
                                            {!achieved && ub.max_progress > 0 && (
                                                <div className="w-full h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                                    <div
                                                        className="h-full bg-plank-blue"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <div className="text-sm p-1">
                                            <p className="font-semibold">{b.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {b.description}
                                            </p>
                                            {achieved ? (
                                                <p className="text-xs text-plank-green mt-1">
                                                    Achieved:{" "}
                                                    {new Date(ub.earned_at!).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            day: "numeric",
                                                            month: "long",
                                                            year: "numeric",
                                                        }
                                                    )}
                                                </p>
                                            ) : ub.max_progress > 0 ? (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Progress: {ub.progress}/{ub.max_progress}
                                                </p>
                                            ) : null}
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            );
                        })}
                    </TooltipProvider>
                </div>
            </CardContent>
        </Card>
    );
};

export default AchievementBadges;
