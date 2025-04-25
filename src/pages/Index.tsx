import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PlankTimer from '@/components/PlankTimer';
import UserStats from '@/components/UserStats';
import Leaderboard from '@/components/Leaderboard';
import AchievementBadges from '@/components/AchievementBadges';
import { Button } from "@/components/ui/button";

const Index = () => {

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
              <Link to="/auth">
                <Button size="lg" className="bg-white text-plank-blue hover:bg-gray-100">
                  Get Started
                </Button>
              </Link>
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

        {/* Timer and Stats Section */}
        <section id="timer-stats-section" className="py-12 px-6 bg-white scroll-mt-header">
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
              <UserStats />
            </div>
          </div>
        </section>

        {/* Leaderboard and Achievements Section */}
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

        {/* MOVED: Learn More Section */}
        <section id="learn-more-section" className="py-16 px-6 bg-white scroll-mt-header">
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold font-poppins mb-4">
              Why Rank Your Plank?
            </h2>
            <p className="text-gray-700 mb-4">
              The plank exercise is a fantastic way to build core strength, improve posture, and reduce back pain. It engages multiple muscle groups simultaneously, making it a highly efficient workout.            </p>
            <p className="text-gray-700 mb-4">
              Our platform helps you stay motivated by tracking your progress, providing challenges to keep things interesting, and connecting you with a community of fellow plank enthusiasts. See how you stack up on the leaderboard and earn badges for your achievements!            </p>
            <p className="text-gray-700 mb-4">
              This project is especially designed with developers in mind — making use of those in-between moments while AI is generating code. Instead of waiting idly, why not drop into a quick plank and level up your health along with your projects?
            </p>
            <p className="text-gray-700">
              Ready to take the first step? Click "Get Started" above to create your account or log in.
            </p>
          </div>
        </section>

        {/* Call to Action */}
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
                Sign Up - It's Free
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
