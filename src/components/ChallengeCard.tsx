// src/components/ChallengeCard.tsx

import React, { useState, useEffect } from 'react';
import {
    Card,
    CardHeader,
    CardContent,
    CardFooter,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Clock as ClockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import styles from "@/pages/style/Challenges.module.css";

export interface Challenge {
    id: number;
    title: string;
    description: string;
    image: string;
    startDate: string;   // YYYY-MM-DD
    startTime?: string;  // HH:mm:ss
    endDate: string;     // YYYY-MM-DD (unused for logic)
    participants: number;
    type: string;
    meeting_url?: string;
}

interface ChallengeCardProps {
    challenge: Challenge;
    onJoin: (id: number) => Promise<void>;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onJoin }) => {
    const {
        id,
        title,
        description,
        image,
        startDate,
        startTime,
        participants,
        type,
        meeting_url,
    } = challenge;

    const [joined, setJoined] = useState(false);
    const [checking, setChecking] = useState(true);
    const [isExpired, setIsExpired] = useState(false);

    // 1) Check if current user already joined
    useEffect(() => {
        let isMounted = true;
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setChecking(false);
                return;
            }
            const { data, error } = await supabase
                .from("challenge_participants")
                .select("id", { count: 'exact' })
                .eq("user_id", user.id)
                .eq("challenge_id", id)
                .single();
            if (!error && data && isMounted) {
                setJoined(true);
            }
            setChecking(false);
        })();
        return () => { isMounted = false; };
    }, [id]);

    // 2) Schedule “completed” watermark after start +10min, and deletion at day's end
    useEffect(() => {
        if (!startTime) return;
        const startDT = new Date(`${startDate}T${startTime}`);
        const completeAt = new Date(startDT.getTime() + 10 * 60_000);
        const deleteAt = new Date(`${startDate}T23:59:59`);

        const now = new Date();
        let completeTimer: ReturnType<typeof setTimeout>;
        let deleteTimer: ReturnType<typeof setTimeout>;

        // mark as completed
        if (now >= completeAt) {
            setIsExpired(true);
        } else {
            completeTimer = setTimeout(() => setIsExpired(true),
                completeAt.getTime() - now.getTime()
            );
        }

        // delete record at end of day
        const doDelete = async () => {
            await supabase
                .from("challenges")
                .delete()
                .eq("id", id);
        };
        if (now >= deleteAt) {
            doDelete();
        } else {
            deleteTimer = setTimeout(doDelete,
                deleteAt.getTime() - now.getTime()
            );
        }

        return () => {
            if (completeTimer) clearTimeout(completeTimer);
            if (deleteTimer) clearTimeout(deleteTimer);
        };
    }, [startDate, startTime, id]);

    // 3) Join handler
    const handleJoin = async () => {
        await onJoin(id);
        setJoined(true);
    };

    // disable buttons when expired
    const disableActions = isExpired;

    return (
        <div className="relative h-full">
            {isExpired && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <span className="transform -rotate-45 text-6xl font-bold bg-black bg-opacity-60 text-white px-4 py-2">
                        COMPLETED
                    </span>
                </div>
            )}

            <Card
                className={`
          transform transition-transform duration-300 ease-in-out
          hover:scale-105 origin-center
          ${styles.challengeCard}
          ${isExpired ? 'opacity-50' : ''}
        `}
            >
                <div className={styles.cardImageContainer}>
                    <img src={image} alt={title} className={styles.cardImage} />
                </div>

                <CardHeader className={styles.cardHeader}>
                    <CardTitle className={styles.cardTitle}>{title}</CardTitle>
                    <Badge variant="secondary">{type}</Badge>
                </CardHeader>

                <CardContent className={styles.cardContent}>
                    <p className={styles.cardDescription}>{description}</p>
                    <div className={styles.cardMeta}>
                        <div className="flex items-center">
                            <Calendar className={`${styles.metaIcon} ${styles.metaIconBlue} mr-1`} />
                            <span>{startDate}</span>
                        </div>
                        {startTime && (
                            <div className="flex items-center">
                                <ClockIcon className={`${styles.metaIcon} ${styles.metaIconBlue} mr-1`} />
                                <span>{startTime.slice(0, 5)}</span>
                            </div>
                        )}
                        <div className="flex items-center">
                            <Users className={`${styles.metaIcon} ${styles.metaIconGreen} mr-1`} />
                            <span>{participants} participants</span>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className={`flex flex-col sm:flex-row justify-between items-center ${styles.cardFooter}`}>
                    <Button
                        onClick={handleJoin}
                        disabled={checking || joined || disableActions}
                        className="w-full mb-2 sm:mb-0"
                    >
                        {checking
                            ? "Checking…"
                            : joined
                                ? "You Are In"
                                : "Join Challenge"
                        }
                    </Button>
                    {joined && meeting_url && (
                        <Button
                            onClick={() => window.open(meeting_url, "_blank")}
                            disabled={disableActions}
                            className="w-full"
                        >
                            Join Video Call
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
};

export default ChallengeCard;
