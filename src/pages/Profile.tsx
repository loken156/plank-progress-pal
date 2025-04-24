
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UserStats from '@/components/UserStats';
import AchievementBadges from '@/components/AchievementBadges';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Calendar, 
  User, 
  Clock, 
  TrendingUp 
} from "lucide-react";

const Profile = () => {
  // Mock data for the user profile
  const user = {
    name: "Emma Johansson",
    username: "emma_fit",
    profileImage: "https://i.pravatar.cc/300?img=25",
    joinDate: "Mars 2024",
    bio: "Träningsentusiast och plankutmanare 💪 Jobbar på att förbättra min kärna och delar min resa!"
  };

  // Mock data for plank history
  const plankHistory = [
    { id: 1, date: "24 april", time: 180, day: "Idag" },
    { id: 2, date: "23 april", time: 165, day: "Igår" },
    { id: 3, date: "22 april", time: 170, day: "Tisdag" },
    { id: 4, date: "21 april", time: 155, day: "Måndag" },
    { id: 5, date: "20 april", time: 160, day: "Söndag" },
  ];

  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-gray-50">
        {/* Profile Header */}
        <section className="bg-gradient-to-r from-plank-blue to-plank-green text-white py-12 px-6">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden flex-shrink-0">
                <img 
                  src={user.profileImage} 
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold font-poppins mb-1">
                  {user.name}
                </h1>
                <p className="text-lg opacity-90 mb-3">@{user.username}</p>
                <p className="max-w-lg opacity-80 mb-4">
                  {user.bio}
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 opacity-70" />
                    <span className="text-sm">Medlem sedan {user.joinDate}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1 opacity-70" />
                    <span className="text-sm">12 Följare</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto py-8 px-6">
          {/* Stats Section */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4">Min Statistik</h2>
            <UserStats />
          </section>

          {/* Plank History */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4">Plankhistorik</h2>
            <Card className="plank-card">
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Clock className="h-5 w-5 text-plank-blue mr-2" />
                  Senaste Plankor
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y">
                  {plankHistory.map(entry => (
                    <li key={entry.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="font-medium">{entry.day}</p>
                        <p className="text-sm text-gray-500">{entry.date}</p>
                      </div>
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-plank-light-blue rounded-full flex items-center justify-center mr-3">
                          <Clock className="h-4 w-4 text-plank-blue" />
                        </div>
                        <span className="font-semibold">{formatTime(entry.time)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="p-4 border-t text-center">
                  <button className="text-plank-blue font-medium hover:underline">
                    Visa hela historiken
                  </button>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4">Mina Prestationer</h2>
            <AchievementBadges />
          </section>

          {/* Progress Graph Placeholder */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Min Utveckling</h2>
            <Card className="plank-card">
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="h-5 w-5 text-plank-green mr-2" />
                  Plank Utveckling
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-60 bg-gray-100 rounded-md flex items-center justify-center">
                  <p className="text-gray-500">Utvecklingsdiagram kommer snart</p>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
