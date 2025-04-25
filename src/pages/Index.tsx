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
import {
    Card,
    CardHeader,
    CardContent,
    CardTitle,
} from '@/components/ui/card';
import { Calendar, Users } from 'lucide-react';

type FeaturedChallenge = {
    id: number;
    title: string;
    description: string;
    image: string;
    start_date: string;
    end_date: string;
    participants: number;
    meeting_url: string | null;
};

const Index: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [featured, setFeatured] = useState<FeaturedChallenge | null>(null);
    const [fcLoading, setFcLoading] = useState(false);

    useEffect(() => {
        async function loadFeatured() {
            setFcLoading(true);
            const { data, error } = await supabase
                .from<FeaturedChallenge>('challenges')
                .select(
                    `id, title, description, image, start_date, end_date, participants, meeting_url`
                )
                .eq('is_active', true)
                .order('start_date', { ascending: true })
                .limit(1)
                .single();

            if (error) {
                console.error('Could not load featured challenge', error);
            } else if (data) {
                setFeatured(data);
            }
            setFcLoading(false);
        }
        loadFeatured();
    }, []);

    const scrollToSection = (sectionId: string) => {
        const section = document.getElementById(sectionId);
        section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleGetStartedClick = () => {
        if (user) scrollToSection('timer-stats-section');
        else navigate('/auth');
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <main className="flex-grow">
                {/* Hero */}
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
                                onClick={() => scrollToSection('learn-more-section')}
                            >
                                Learn More
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Timer & Stats */}
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

                {/* Featured Challenge (moved below timer) */}
                {featured && (
                    <section className="py-12 px-6 bg-white">
                        <div className="container mx-auto">
                            <h2 className="text-2xl font-semibold mb-6 text-center">
                                Featured Challenge
                            </h2>
                            <div className="max-w-md mx-auto">
                                <Card>
                                    <div className="h-32 max-w-xs mx-auto overflow-hidden rounded-t-lg">
                                        <img
                                            src={featured.image}
                                            alt={featured.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <CardHeader className="pt-4 text-center">
                                        <CardTitle className="text-xl">
                                            {featured.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="mb-4 text-center">{featured.description}</p>
                                        <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-700">
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-1 text-plank-blue" />
                                                <span>
                                                    {new Date(featured.start_date).toLocaleDateString()}{' '}
                                                    –{' '}
                                                    {new Date(featured.end_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <Users className="w-4 h-4 mr-1 text-plank-green" />
                                                <span>{featured.participants} participants</span>
                                            </div>
                                            {featured.meeting_url && (
                                                <div className="flex items-center">
                                                    <a
                                                        href={featured.meeting_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="underline text-plank-blue"
                                                    >
                                                        Join video call
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </section>
                )}

                {/* Leaderboard & Achievements */}
                <section className="py-12 px-6 bg-gray-50 scroll-mt-header">
                    <div className="container mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-xl font-semibold mb-4">Leaderboard</h3>
                                <Leaderboard />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-4">Your Achievements</h3>
                                <AchievementBadges />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Learn More */}
                <section
                    id="learn-more-section"
                    className="py-16 px-6 bg-white scroll-mt-header"
                >
                    <div className="container mx-auto max-w-3xl text-center">
                        <h2 className="text-2xl md:text-3xl font-bold font-poppins mb-4">
                            Why Rank Your Plank?
                        </h2>
                        <p className="text-gray-700 mb-4">
                            The plank exercise is a fantastic way to build core strength, improve posture,
                            and reduce back pain. It engages multiple muscle groups simultaneously,
                            making it a highly efficient workout.
                        </p>
                        <p className="text-gray-700 mb-4">
                            Our platform helps you stay motivated by tracking your progress, providing
                            challenges to keep things interesting, and connecting you with a community
                            of fellow plank enthusiasts. See how you stack up on the leaderboard and
                            earn badges for your achievements!
                        </p>
                        <p className="text-gray-700 mb-4">
                            This project is especially designed with developers in mind — making use of
                            those in-between moments while AI is generating code. Instead of waiting idly,
                            why not drop into a quick plank and level up your health along with your projects?
                        </p>
                        <p className="text-gray-700">
                            Ready to take the first step? Click "Get Started" above to create your
                            account or log in.
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
                            Register now to start logging your planks, join challenges,
                            and compete with friends!
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
