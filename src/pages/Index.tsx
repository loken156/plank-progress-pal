// src/pages/Index.tsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PlankTimer from '@/components/PlankTimer';
import UserStats from '@/components/UserStats';
import Leaderboard from '@/components/Leaderboard';
import AchievementBadges from '@/components/AchievementBadges';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import ChallengeCard, { Challenge as ChallengeType } from '@/components/ChallengeCard';

const Index: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [featured, setFeatured] = useState<ChallengeType | null>(null);
    const [loadingFeatured, setLoadingFeatured] = useState(false);

    useEffect(() => {
        async function loadFeatured() {
            setLoadingFeatured(true);

            // 1) Build "today" and "now minus 10min" filters
            const now = new Date();
            const today = now.toISOString().slice(0, 10);            // "YYYY-MM-DD"
            const threshold = new Date(now.getTime() - 10 * 60_000); // now − 10min
            const threshTime = threshold.toTimeString().slice(0, 8); // "HH:MM:SS"

            // 2) Fetch the very next active challenge that hasn't "completed" yet
            const { data, error } = await supabase
                .from('challenges')
                .select(
                    `id,
           title,
           description,
           image,
           start_date,
           start_time,
           end_date,
           participants,
           type,
           meeting_url`
                )
                .eq('is_active', true)
                // only those starting after today, OR starting today after threshold
                .or(
                    `and(start_date.gt.${today}),and(start_date.eq.${today},start_time.gt.${threshTime})`
                )
                .order('start_date', { ascending: true })
                .order('start_time', { ascending: true })
                .limit(1)
                .single();

            if (error) {
                console.error('Could not load featured challenge', error);
            } else if (data) {
                setFeatured({
                    id: data.id,
                    title: data.title,
                    description: data.description,
                    image: data.image,
                    startDate: data.start_date,
                    startTime: data.start_time || undefined,
                    endDate: data.end_date,
                    participants: data.participants,
                    type: data.type,
                    meeting_url: data.meeting_url || undefined,
                });
            }

            setLoadingFeatured(false);
        }

        loadFeatured();
    }, []);

    const handleGetStartedClick = () => {
        if (user) {
            const section = document.getElementById('timer-stats-section');
            section?.scrollIntoView({ behavior: 'smooth' });
        } else {
            navigate('/auth');
        }
    };

    // allow joining featured challenge
    const handleJoinFeatured = async (challengeId: number) => {
        const {
            data: { user: currentUser },
        } = await supabase.auth.getUser();
        if (!currentUser) return;

        // prevent double-join
        const { data: existing } = await supabase
            .from('challenge_participants')
            .select('*')
            .eq('user_id', currentUser.id)
            .eq('challenge_id', challengeId)
            .single();
        if (existing) return;

        // insert participant
        await supabase.from('challenge_participants').insert({
            user_id: currentUser.id,
            challenge_id: challengeId,
        });

        // bump participants count
        const { data: ch } = await supabase
            .from('challenges')
            .select('participants')
            .eq('id', challengeId)
            .single();
        if (ch) {
            await supabase
                .from('challenges')
                .update({ participants: ch.participants + 1 })
                .eq('id', challengeId);

            // update local featured state
            setFeatured((f) =>
                f && f.id === challengeId
                    ? { ...f, participants: f.participants + 1 }
                    : f
            );
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-plank-blue to-plank-green text-white py-16 px-6">
                    <div className="container mx-auto text-center">
                        <h1 className="text-3xl md:text-5xl font-bold font-poppins mb-4 leading-tight">
                            Challenge yourself, improve your plank!
                        </h1>
                        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 opacity-90">
                            Log your plank, join challenges, and compete against other users to reach the top!
                        </p>
                        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 opacity-90">
                            While AI slaves away, submit your plank of the day!
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button
                                size="lg"
                                className="bg-white text-plank-blue hover:bg-gray-100"
                                onClick={handleGetStartedClick}
                            >
                                Get Started
                            </Button>
                            <Button
                                size="lg"
                                className="bg-white text-plank-blue hover:bg-gray-100"
                                onClick={() => {
                                    const section = document.getElementById('learn-more-section');
                                    section?.scrollIntoView({ behavior: 'smooth' });
                                }}
                            >
                                Learn More
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Today's Plank & Stats */}
                <section
                    id="timer-stats-section"
                    className="py-12 px-6 bg-white scroll-mt-header"
                >
                    <div className="container mx-auto">
                        <div className="mb-10 text-center">
                            <h2 className="text-2xl md:text-3xl font-bold font-poppins mb-2">
                                Today's Plank
                            </h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                Set a timer, challenge yourself, and keep track of your progress
                            </p>
                        </div>

                        <div className="max-w-md mx-auto mb-12">
                            <PlankTimer />
                        </div>

                        <div className="mb-10">
                            <h3 className="text-xl font-semibold mb-4">Your Stats</h3>
                            <UserStats userId={user?.id || ''} />
                        </div>
                    </div>
                </section>

                {/* Featured Challenge */}
                {featured && !loadingFeatured && (
                    <section className="py-12 px-6 bg-white">
                        <div className="container mx-auto max-w-md mx-auto">
                            <h2 className="text-2xl font-semibold mb-6 text-center">
                                Featured Challenge
                            </h2>
                            <ChallengeCard
                                challenge={featured}
                                onJoin={handleJoinFeatured}
                            />
                        </div>
                    </section>
                )}

                {/* Leaderboard & Achievements */}
                <section className="py-12 px-6 bg-gray-50 scroll-mt-header">
                    <div className="container mx-auto">
                        <div className="grid grid-cols-1 gap-8">
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Leaderboard</h2>
                                <Leaderboard />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Learn More Section */}
                <section
                    id="learn-more-section"
                    className="py-16 px-6 bg-white scroll-mt-header"
                >
                    <div className="container mx-auto max-w-3xl text-center">
                        <h2 className="text-2xl md:text-3xl font-bold font-poppins mb-4">
                            Why Rank A Plank?
                        </h2>
                        <p className="text-gray-700 mb-4">
                            The plank exercise is a fantastic way to build core strength, improve posture, and reduce back pain. It engages multiple muscle groups simultaneously, making it a highly efficient workout.
                        </p>
                        <p className="text-gray-700 mb-4">
                            Our platform helps you stay motivated by tracking your progress, providing challenges to keep things interesting, and connecting you with a community of fellow plank enthusiasts. See how you stack up on the leaderboard and earn badges for your achievements!
                        </p>
                        <p className="text-gray-700 mb-4">
                            This project is especially designed with developers in mind — making use of those in-between moments while AI is generating code. Instead of waiting idly, why not drop into a quick plank and level up your health along with your projects?
                        </p>
                        <p className="text-gray-700">
                            Ready to take the first step? Click "Get Started" above to create your account or log in.
                        </p>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-16 px-6 text-center bg-gray-50 scroll-mt-header">
                    <div className="container mx-auto">
                        <h2 className="text-2xl md:text-3xl font-bold font-poppins mb-4">
                            Ready to improve your plank?
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
                            Register now to start logging your planks, join challenges, and compete with friends!
                        </p>
                        <Link to="/auth">
                            <Button size="lg" className="plank-btn-primary">
                                Sign Up — It’s Free
                            </Button>
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Index;
