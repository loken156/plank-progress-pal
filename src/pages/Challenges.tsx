import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChallengeCard from "@/components/ChallengeCard";
import { Challenge } from "@/components/ChallengePopup";
import styles from "./style/Challenges.module.css";

const Challenges: React.FC = () => {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchChallenges() {
            setLoading(true);
            // 1) Who’s logged in?
            const {
                data: { user },
                error: userErr,
            } = await supabase.auth.getUser();
            if (userErr || !user) {
                console.error("No user logged in");
                setChallenges([]);
                setLoading(false);
                return;
            }

            // 2) Load all challenges (including start_time)
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

            // 3) Fetch this user’s joined challenge IDs
            const { data: parts } = await supabase
                .from("challenge_participants")
                .select("challenge_id")
                .eq("user_id", user.id);
            const joinedIds = new Set(parts?.map((p) => p.challenge_id) || []);

            // 4) Map into our UI shape
            const mapped: Challenge[] = rawChallenges.map((db) => ({
                id: db.id,
                title: db.title,
                description: db.description,
                image: db.image,
                startDate: db.start_date,
                startTime: db.start_time || undefined,
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
            error: userErr,
        } = await supabase.auth.getUser();
        if (userErr || !user) return;

        // Prevent double-join
        const { data: existing } = await supabase
            .from("challenge_participants")
            .select("*")
            .eq("user_id", user.id)
            .eq("challenge_id", challengeId)
            .single();
        if (existing) return;

        // 1) Insert participation
        await supabase.from("challenge_participants").insert({
            user_id: user.id,
            challenge_id: challengeId,
        });

        // 2) Bump participants count
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

            // 3) Update local state
            setChallenges((prev) =>
                prev.map((c) =>
                    c.id === challengeId
                        ? { ...c, participants: c.participants + 1, isParticipating: true }
                        : c
                )
            );
        }
    };

    // only show active, not-yet-ended challenges
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
                            <ChallengeCard
                                key={c.id}
                                challenge={c}
                                onJoin={handleJoinChallenge}
                            />
                        ))}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Challenges;
