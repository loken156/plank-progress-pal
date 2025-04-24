import React, { useState, useEffect } from "react";
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
        earned_at: string | null;
    } | null;
};

const AchievementBadges: React.FC = () => {
    const [badges, setBadges] = useState<BadgeRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadBadges() {
            setLoading(true);
            try {
                // 1) get current user
                const {
                    data: { user },
                    error: userErr,
                } = await supabase.auth.getUser();
                if (userErr || !user) throw userErr || new Error("No user");

                // 2) refresh badge progress & earned_at

                // 3) fetch joined badges + user_badges
                const { data, error } = await supabase
                    .from<BadgeRow>("badges")
                    .select(`
            id,
            name,
            icon_url,
            description,
            criteria,
            user_badges!inner ( progress, max_progress, earned_at )
          `)
                    .eq("user_badges.user_id", user.id);

                if (error) throw error;
                setBadges(data || []);
            } catch (err: any) {
                console.error(err);
                toast.error("Kunde inte ladda prestationer.");
            } finally {
                setLoading(false);
            }
        }

        loadBadges();
    }, []);

    if (loading) {
        return <div className="text-center py-6">Laddar prestationer…</div>;
    }

    return (
        <Card className="plank-card">
            <CardHeader className="pb-2 border-b">
                <CardTitle className="text-lg font-poppins">
                    Prestationer och Utmärkelser
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                    <TooltipProvider delayDuration={300}>
                        {badges.map((b) => {
                            const ub = b.user_badges!;
                            const achieved = !!ub.earned_at;
                            const pct = ub.max_progress
                                ? Math.min(100, (ub.progress / ub.max_progress) * 100)
                                : 0;

                            return (
                                <Tooltip key={b.id}>
                                    <TooltipTrigger asChild>
                                        <div className={`
            aspect-square rounded-lg flex flex-col items-center justify-center p-2
            cursor-pointer border-2 transition-all
            ${achieved
                                                ? "border-plank-green bg-green-50"
                                                : "border-dashed border-gray-300"
                                            }
          `}>
                                            <div className="text-3xl mb-1">{b.icon_url}</div>
                                            <span className={`
              text-xs font-medium text-center
              ${achieved ? "text-plank-green" : "text-gray-500"}
            `}>
                                                {b.name}
                                            </span>

                                            {/* new: use ub.max_progress */}
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
                                            <p className="text-xs text-gray-500">{b.description}</p>
                                            {achieved ? (
                                                <p className="text-xs text-plank-green mt-1">
                                                    Uppnådd:{" "}
                                                    {new Date(ub.earned_at!).toLocaleDateString("sv-SE", {
                                                        day: "numeric",
                                                        month: "long",
                                                        year: "numeric",
                                                    })}
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
