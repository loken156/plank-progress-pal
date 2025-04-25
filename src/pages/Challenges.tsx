import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users } from 'lucide-react';
import styles from './style/Challenges.module.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchChallenges = async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('id, title, description, image, start_date, end_date, participants, is_active, type')
        .order('start_date', { ascending: true });

      if (error) {
        console.error('Error fetching challenges:', error);
        setChallenges([]);
      } else if (data) {
        const mappedChallenges: Challenge[] = data.map(dbChallenge => ({
          id: dbChallenge.id,
          title: dbChallenge.title,
          description: dbChallenge.description,
          image: dbChallenge.image,
          startDate: dbChallenge.start_date,
          endDate: dbChallenge.end_date,
          participants: dbChallenge.participants,
          isActive: dbChallenge.is_active,
          type: dbChallenge.type,
        }));
        setChallenges(mappedChallenges);
      } else {
        setChallenges([]);
      }
      setLoading(false);
    };

    fetchChallenges();
  }, []);

  const handleJoinChallenge = async (challengeId: number) => {
    const {
      data: { user },
      error: userErr
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      console.error("Ingen användare inloggad");
      return;
    }

    const { data: existing, error: checkErr } = await supabase
      .from('challenge_participants')
      .select('*')
      .eq('user_id', user.id)
      .eq('challenge_id', challengeId)
      .single();

    if (existing) {
      console.log("Redan med i denna challenge");
      return;
    }

    const { error: joinErr } = await supabase
      .from('challenge_participants')
      .insert({ user_id: user.id, challenge_id: challengeId });

    if (joinErr) {
      console.error("Fel vid anmälan:", joinErr);
      return;
    }

    // Hämta nuvarande deltagarantal
    const { data: current, error: fetchErr } = await supabase
      .from('challenges')
      .select('participants')
      .eq('id', challengeId)
      .single();

    if (fetchErr || !current) {
      console.error('Misslyckades att hämta challenge:', fetchErr);
      return;
    }

    const { error: updateErr } = await supabase
      .from('challenges')
      .update({ participants: current.participants + 1 })
      .eq('id', challengeId);

    if (updateErr) {
      console.error('Fel vid uppdatering av deltagare:', updateErr);
      return;
    }

    // Lokalt uppdatera state
    setChallenges((prev) =>
      prev.map((c) =>
        c.id === challengeId
          ? { ...c, participants: c.participants + 1, isParticipating: true }
          : c
      )
    );
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <section className={styles.hero}>
        <div className="container mx-auto">
          <div className={styles.heroContentWrapper}>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Plank Challenges</h1>
            <p className="text-lg md:text-xl mb-6 opacity-90">
              Join challenges, compete with others, and improve your plank together with the community!
            </p>
          </div>
        </div>
      </section>

      <main className={`flex-grow py-12 px-6 ${styles.container}`}>
        <h2 className="text-2xl font-bold mb-8">Current Challenges</h2>
        <div className={styles.grid}>
          {challenges
            .filter(challenge => {
              const endDate = new Date(challenge.endDate);
              endDate.setHours(0, 0, 0, 0);
              return challenge.isActive && endDate >= today;
            })
            .map((challenge) => (
              <Card key={challenge.id} className={styles.challengeCard}>
                <div className={styles.cardImageContainer}>
                  <img
                    src={challenge.image}
                    alt={challenge.title}
                    className={styles.cardImage}
                  />
                </div>
                <CardHeader className={styles.cardHeader}>
                  <CardTitle className={styles.cardTitle}>{challenge.title}</CardTitle>
                  <Badge variant="secondary">{challenge.type}</Badge>
                </CardHeader>
                <CardContent className={styles.cardContent}>
                  <p className={styles.cardDescription}>{challenge.description}</p>
                  <div className={styles.cardMeta}>
                    <div className={styles.metaItem}>
                      <Calendar className={`${styles.metaIcon} ${styles.metaIconBlue}`} />
                      <span>{challenge.startDate} - {challenge.endDate}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <Users className={`${styles.metaIcon} ${styles.metaIconGreen}`} />
                      <span>{challenge.participants} participants</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className={styles.cardFooter}>
                  <Button onClick={() => handleJoinChallenge(challenge.id)} className={styles.joinButton}>
                    Join Challenge
                  </Button>
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
