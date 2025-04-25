// src/pages/Challenges.tsx

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
    Card,
    CardHeader,
    CardContent,
    CardFooter,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Clock as ClockIcon } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChallengePopup, { Challenge } from "@/components/ChallengePopup";
import styles from "./style/Challenges.module.css";

const Challenges: React.FC = () => {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchChallenges() {
            setLoading(true);

            // 1) who is the user?
            const {
                data: { user },
                error: userErr,
            } = await supabase.auth.getUser();
            if (userErr || !user) {
                console.error("No user");
                setChallenges([]);
                setLoading(false);
                return;
            }

            // 2) load all challenges, now including start_time
            const { data: rawChallenges, error: chErr } = await supabase
                .from("challenges")
                .select(`
          id,
          title,
          description,
          image,
          start_date,
          start_time,
          end_date,
          participants,
          is_active,
          type,
          meeting_url
        `)
                .order("start_date", { ascending: true });

            if (chErr || !rawChallenges) {
                console.error("Error fetching challenges:", chErr);
                setChallenges([]);
                setLoading(false);
                return;
            }

            // 3) load this user's joined challenge IDs
            const { data: parts } = await supabase
                .from("challenge_participants")
                .select("challenge_id")
                .eq("user_id", user.id);
            const joinedIds = new Set(parts?.map((p) => p.challenge_id) || []);

            // 4) merge into our shape
            const mapped: Challenge[] = rawChallenges.map((db) => ({
                id: db.id,
                title: db.title,
                description: db.description,
                image: db.image,
                startDate: db.start_date,
                startTime: db.start_time,       // NEW
                endDate: db.end_date,
                participants: db.participants,
                isActive: db.is_active,
                type: db.type,
                meeting_url: db.meeting_url || undefined,
                isParticipating: joinedIds.has(db.id),
            }));

            setChallenges(mapped);
            setLoading(false);
        }

        fetchChallenges();
    }, []);

    const handleJoinChallenge = async (challengeId: number) => {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Prevent double-join
        const { data: existing } = await supabase
            .from("challenge_participants")
            .select("*")
            .eq("user_id", user.id)
            .eq("challenge_id", challengeId)
            .single();
        if (existing) return;

        // Join & bump count
        await supabase.from("challenge_participants").insert({
            user_id: user.id,
            challenge_id: challengeId,
        });
        const { data: ch } = await supabase
            .from("challenges")
            .select("participants")
            .eq("id", challengeId)
            .single();
        if (ch) {
            await supabase
                .from("challenges")
                .update({ participants: ch.participants + 1 })
                .eq("id", challengeId);
            setChallenges((prev) =>
                prev.map((c) =>
                    c.id === challengeId
                        ? { ...c, participants: c.participants + 1, isParticipating: true }
                        : c
                )
            );
        }
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">Loading…</div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <section className={styles.hero}>
                <div className="container mx-auto">
                    <div className={styles.heroContentWrapper}>
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">
                            Plank Challenges
                        </h1>
                        <p className="text-lg md:text-xl mb-6 opacity-90">
                            Join challenges, compete with others, and improve your plank
                            together with the community!
                        </p>
                    </div>
                </div>
            </section>

            <main className={`flex-grow py-12 px-6 ${styles.container}`}>
                <h2 className="text-2xl font-bold mb-8">Current Challenges</h2>
                <div className={styles.grid}>
                    {challenges
                        .filter((c) => {
                            const end = new Date(c.endDate);
                            end.setHours(0, 0, 0, 0);
                            return c.isActive && end >= today;
                        })
                        .map((c) => (
                            <Card key={c.id} className={styles.challengeCard}>
                                <div className={styles.cardImageContainer}>
                                    <img
                                        src={c.image}
                                        alt={c.title}
                                        className={styles.cardImage}
                                    />
                                </div>
                                <CardHeader className={styles.cardHeader}>
                                    <CardTitle className={styles.cardTitle}>
                                        {c.title}
                                    </CardTitle>
                                    <Badge variant="secondary">{c.type}</Badge>
                                </CardHeader>
                                <CardContent className={styles.cardContent}>
                                    <p className={styles.cardDescription}>{c.description}</p>
                                    <div className={styles.cardMeta}>
                                        {/* Date */}
                                        <div className={`${styles.metaItem} flex items-center`}>
                                            <Calendar
                                                className={`${styles.metaIcon} ${styles.metaIconBlue} mr-1`}
                                            />
                                            <span>
                                                {c.startDate} – {c.endDate}
                                            </span>
                                        </div>

                                        {/* Time (only if set) */}
                                        {c.startTime && (
                                            <div className={`${styles.metaItem} flex items-center`}>
                                                <ClockIcon
                                                    className={`${styles.metaIcon} ${styles.metaIconBlue} mr-1`}
                                                />
                                                <span>{c.startTime.slice(0, 5)}</span>
                                            </div>
                                        )}

                                        {/* Participants */}
                                        <div className={`${styles.metaItem} flex items-center`}>
                                            <Users
                                                className={`${styles.metaIcon} ${styles.metaIconGreen} mr-1`}
                                            />
                                            <span>{c.participants} participants</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter
                                    className={`${styles.cardFooter} flex items-center gap-4`}
                                >
                                    {c.isParticipating ? (
                                        <Button disabled>You Are In</Button>
                                    ) : (
                                        <Button onClick={() => handleJoinChallenge(c.id)}>
                                            Join Challenge
                                        </Button>
                                    )}
                                    <ChallengePopup
                                        challenge={c}
                                        trigger={<Button variant="link">View details</Button>}
                                    />
                                </CardFooter>
                            </Card>
                        ))}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Challenges;
