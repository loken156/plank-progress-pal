
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, TrendingUp } from "lucide-react";

type Challenge = {
  id: number;
  title: string;
  description: string;
  image: string;
  startDate: string;
  endDate: string;
  participants: number;
  isActive: boolean;
  isParticipating?: boolean;
  progress?: number;
  type: string;
};

const Challenges = () => {
  // Mock data for challenges
  const challenges: Challenge[] = [
    {
      id: 1,
      title: "13 Plankan",
      description: "Planka i 13 dagar på raken för att utmana din kärna och mentala styrka. Perfect för dig som vill komma igång med en daglig rutin!",
      image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
      startDate: "1 maj",
      endDate: "13 maj",
      participants: 467,
      isActive: true,
      type: "Streak"
    },
    {
      id: 2,
      title: "30-Dagars Plankutmaning",
      description: "Öka tiden med 5 sekunder varje dag och nå 2,5 minuter på 30 dagar. För dig som vill bygga uthållighet steg för steg.",
      image: "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1769&q=80",
      startDate: "1 maj",
      endDate: "30 maj",
      participants: 856,
      isActive: true,
      isParticipating: true,
      progress: 40,
      type: "Progression"
    },
    {
      id: 3,
      title: "Vårens 5-Minuters Planka",
      description: "Träna upp din uthållighet för att nå det ultimata målet: en 5 minuters planka innan sommarens början!",
      image: "https://images.unsplash.com/photo-1607962837359-5e7e89f86776?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
      startDate: "15 maj",
      endDate: "15 juni",
      participants: 321,
      isActive: false,
      type: "Plank Time"
    },
    {
      id: 4,
      title: "Grupputmaningen",
      description: "Bjud in 3 vänner och tävla som ett lag mot andra grupper. Den grupp som gemensamt plankar mest tid vinner!",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
      startDate: "1 juni",
      endDate: "30 juni",
      participants: 152,
      isActive: false,
      type: "Team"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-plank-blue to-plank-green text-white py-12 px-6">
          <div className="container mx-auto">
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl font-bold font-poppins mb-4">
                Plank Utmaningar
              </h1>
              <p className="text-lg md:text-xl mb-6 opacity-90">
                Delta i utmaningar, tävla mot andra och förbättra din planka tillsammans med gemenskapen!
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 px-6">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold font-poppins mb-8">Aktuella Utmaningar</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {challenges.filter(challenge => challenge.isActive).map(challenge => (
                <Card key={challenge.id} className="plank-card overflow-hidden h-full flex flex-col">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={challenge.image} 
                      alt={challenge.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{challenge.title}</CardTitle>
                      <Badge variant="secondary" className="bg-plank-light-blue text-plank-blue">
                        {challenge.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-gray-600 text-sm mb-4">{challenge.description}</p>
                    <div className="flex flex-wrap gap-y-3 gap-x-6 text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-plank-blue mr-1" />
                        <span>{challenge.startDate} - {challenge.endDate}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-plank-green mr-1" />
                        <span>{challenge.participants} deltagare</span>
                      </div>
                    </div>

                    {challenge.isParticipating && challenge.progress !== undefined && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">Din progress</span>
                          <span>{challenge.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-plank-green" 
                            style={{ width: `${challenge.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-2 border-t">
                    {challenge.isParticipating ? (
                      <Button variant="outline" className="w-full">
                        Visa detaljer
                      </Button>
                    ) : (
                      <Button className="plank-btn-primary w-full">
                        Delta i utmaningen
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>

            <h2 className="text-2xl font-bold font-poppins mt-16 mb-8">Kommande Utmaningar</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {challenges.filter(challenge => !challenge.isActive).map(challenge => (
                <Card key={challenge.id} className="plank-card overflow-hidden h-full flex flex-col">
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={challenge.image} 
                      alt={challenge.title}
                      className="w-full h-full object-cover filter grayscale opacity-80"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Badge className="text-sm py-1.5 px-3 bg-white/80 text-gray-800">
                        Kommer Snart
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{challenge.title}</CardTitle>
                      <Badge variant="outline" className="border-plank-gray text-plank-gray">
                        {challenge.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-gray-600 text-sm mb-4">{challenge.description}</p>
                    <div className="flex flex-wrap gap-y-3 gap-x-6 text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-plank-gray mr-1" />
                        <span>{challenge.startDate} - {challenge.endDate}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-plank-gray mr-1" />
                        <span>{challenge.participants} intresserade</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 border-t">
                    <Button variant="outline" className="w-full">
                      Påminn mig
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="mt-16 text-center">
              <h3 className="text-xl font-bold mb-4">Har du en idé för en utmaning?</h3>
              <p className="text-gray-600 mb-6">Vi älskar att höra förslag från vår gemenskap!</p>
              <Button className="plank-btn-outline">
                Föreslå en utmaning
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Challenges;
