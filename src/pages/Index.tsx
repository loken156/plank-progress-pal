// src/pages/Index.tsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Leaderboard from '@/components/Leaderboard';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Trophy, Clock as ClockIcon, Flag } from "lucide-react";
import PlankTimer from '@/components/PlankTimer';
import DemoProgressGraph from '@/components/DemoProgressGraph';

const Index: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleGetStarted = () => {
        user ? navigate('/profile') : navigate('/auth');
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <main className="flex-grow">
                {/* Hero */}
                <section className="bg-gradient-to-br from-plank-blue to-plank-green text-white py-20 px-6">
                    <div className="container mx-auto text-center">
                        <h1 className="text-4xl md:text-6xl font-bold font-poppins mb-4 leading-tight">
                            Plank Harder, Rank Higher!
                        </h1>
                        <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-8 opacity-90">
                            Hold your plank, log your time, and climb the leaderboard. Compete with friends and build core strength together.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Button
                                size="lg"
                                className="bg-white text-plank-blue hover:bg-gray-100"
                                onClick={handleGetStarted}
                            >
                                Get Started
                            </Button>
                            <Link to="#why-section">
                                <Button
                                    size="lg"
                                    className="bg-transparent border border-white hover:bg-white hover:text-plank-blue"
                                >
                                    Learn More
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="py-16 px-6 bg-gray-50">
                    <div className="container mx-auto max-w-8xl text-center">
                        <h2 className="text-3xl font-bold font-poppins mb-8">Why Should I Plank?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {/* Streaks */}
                            <div className="flex flex-col items-center p-4">
                                <TrendingUp className="h-10 w-10 text-plank-blue mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Streaks</h3>
                                <p className="text-gray-600">
                                    Because nothing says “I’m dedicated” like logging a plank before your coffee.
                                </p>
                            </div>

                            {/* Community */}
                            <div className="flex flex-col items-center p-4">
                                <Users className="h-10 w-10 text-plank-green mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Community</h3>
                                <p className="text-gray-600">
                                    Plank pals who literally have your back… well, your core.
                                </p>
                            </div>

                            {/* Leaderboard */}
                            <div className="flex flex-col items-center p-4">
                                <Trophy className="h-10 w-10 text-yellow-500 mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Leaderboard</h3>
                                <p className="text-gray-600">
                                    Show off your gains and make your friends wish they started yesterday.
                                </p>
                            </div>

                            {/* Challenges */}
                            <div className="flex flex-col items-center p-4">
                                <Flag className="h-10 w-10 text-red-500 mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Challenges</h3>
                                <p className="text-gray-600">
                                    Dive into daily and weekly plank battles. Show them who's the best planker live.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Today's Plank & Timer */}
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
                                Set a timer, challenge yourself, and beat your friends
                            </p>
                        </div>
                        <div className="max-w-md mx-auto mb-12">
                            <PlankTimer />
                        </div>
                    </div>
                </section>

                {/* Demo Progress Graph */}
                <section
                    id="progress-graph"
                    className="py-12 px-6 scroll-mt-header bg-gray-50"
                >
                    <div className="container mx-auto ">
                        <div className="mb-10 text-center">
                            <h2 className="text-3xl font-bold font-poppins mb-2">
                                Evolve Your Plank
                            </h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                Do a plank each day and watch your time skyrocket!
                            </p>
                        </div>
                        <div className="max-w-6xl mx-auto mb-12">
                            <DemoProgressGraph />
                        </div>
                    </div>
                </section>

                {/* Leaderboard */}
                <section className="py-16 px-6 bg-white">
                    <div className="container mx-auto">
                        <h2 className="text-3xl font-semibold text-center mb-2">This Month’s Top Plank Times</h2>
                        <p className="text-gray-600 mb-8 text-center">
                            You can do better than this, right?
                        </p>
                        <Leaderboard />
                    </div>
                </section>

                {/* Why Rank A Plank */}
                <section
                    id="why-section"
                    className="py-16 px-6 bg-gray-50 scroll-mt-header"
                >
                    <div className="container mx-auto max-w-3xl text-center space-y-6">
                        <h2 className="text-3xl font-bold font-poppins">
                            Why Rank A Plank?
                        </h2>
                        <p className="text-gray-700">
                            The plank is a simple yet powerful exercise that targets your entire core —
                            improving posture, boosting stability, and reducing back pain.
                        </p>
                        <p className="text-gray-700">
                            Our platform keeps you motivated with daily logs, community challenges,
                            and a real‐time leaderboard. See where you stack up and earn badges
                            for every milestone you conquer.
                        </p>
                        <p className="text-gray-700">
                            Perfect for busy developers. Drop, log a plank, and get back to coding
                            while the AI does the heavy lifting!
                        </p>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-16 px-6 bg-white text-center">
                    <div className="container mx-auto">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">
                            Ready to Start Planking?
                        </h2>
                        <p className="text-gray-600 mb-8">
                            Sign up now to start logging your planks, join challenges, and compete
                            with the community!<br /><strong>Become the best planker.</strong>
                        </p>
                        <Link to="/auth">
                            <Button size="lg" className="plank-btn-primary">
                                Sign Up - It’s Free
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
