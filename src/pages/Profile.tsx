import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UserStats from "@/components/UserStats";
import AchievementBadges from "@/components/AchievementBadges";
import ProfileHeader, { ProfileData } from "@/components/ProfileHeader";
import PlankHistory, { PlankEntry } from "@/components/PlankHistory";
import ProgressGraph from "@/components/ProfileGraph";
import { toast } from "@/components/ui/sonner";
import { useJoinedChallenges } from "@/hooks/useJoinedChallenges"; // Import the custom hook

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [planks, setPlanks] = useState<PlankEntry[]>([]);
  const [userId, setUserId] = useState<string>("");
  const navigate = useNavigate();

  // Use the custom hook for joined challenges
  const { joinedChallenges, loading: challengesLoading, error: challengesError } = useJoinedChallenges(userId);

  useEffect(() => {
    async function load() {
      // 1) Get logged-in user
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();

      if (userErr || !user) {
        navigate("/login");
        return;
      }
      setUserId(user.id);

      // 2) Fetch profile with proper aliasing
      const { data: row, error } = await supabase
        .from("profiles")
        .select("full_name,username,profile_image,bio,join_date,followers_count")
        .eq("id", user.id)
        .single();

      if (error || !row) {
        toast.error("Kunde inte ladda din profil.");
        return;
      }

      // 3) map into camelCase interface
      const prof: ProfileData = {
        name: row.full_name,
        username: row.username,
        profileImage: row.profile_image,
        bio: row.bio,
        joinDate: row.join_date,
        followersCount: row.followers_count,
      };

      setProfile(prof);

      if (!prof) {
        toast.error("Kunde inte ladda din profil.");
      } else {
        setProfile(prof);
      }

      // 4) Fetch last 5 planks
      const { data: rawPlanks, error: plankErr } = await supabase
        .from<{ id: number; plank_date: string; duration_s: number }>("planks")
        .select("id, plank_date, duration_s")
        .eq("user_id", user.id)
        .order("plank_date", { ascending: false })
        .limit(5);

      if (plankErr) {
        console.error(plankErr);
        return;
      }

      // 5) Map into UI shape
      const mapped = (rawPlanks || []).map((p) => {
        const d = new Date(p.plank_date);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        let dayLabel: string;
        if (d.toDateString() === today.toDateString()) {
          dayLabel = "Idag";
        } else if (d.toDateString() === yesterday.toDateString()) {
          dayLabel = "Igår";
        } else {
          const wd = d.toLocaleDateString("sv-SE", { weekday: "long" });
          dayLabel = wd.charAt(0).toUpperCase() + wd.slice(1);
        }

        const dateDisplay = d.toLocaleDateString("sv-SE", {
          day: "numeric",
          month: "long",
        });

        return {
          id: p.id,
          date: dateDisplay,
          day: dayLabel,
          time: p.duration_s,
        };
      });

      setPlanks(mapped);
    }

    load();
  }, [navigate]);

  const handleSave = async (updates: Partial<ProfileData>) => {
    if (!profile || !userId) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: updates.name,
        profile_image: updates.profileImage,
        bio: updates.bio,
      })
      .eq("id", userId);

    if (error) {
      toast.error("Kunde inte spara ändringar.");
    } else {
      setProfile({ ...profile, ...updates });
      toast.success("Profil uppdaterad!");
    }
  };

  if (!profile) {
    return <div className="p-8 text-center">Laddar din profil…</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow bg-gray-50">
        <ProfileHeader data={profile} onSave={handleSave} />

        <div className="container mx-auto py-8 px-6 space-y-12">
          <section>
            <h2 className="text-xl font-semibold mb-4">Min Statistik</h2>
            <UserStats />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Plankhistorik</h2>
            <PlankHistory
              entries={planks}
              onViewAll={() => navigate("/history")}
            />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">My Progress</h2>
            <ProgressGraph />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">My Challenges</h2>
            {challengesLoading ? (
              <div className="bg-white p-4 shadow-lg rounded-lg text-center">
                <p>Loading challenges...</p>
              </div>
            ) : challengesError ? (
              <div className="bg-white p-4 shadow-lg rounded-lg text-center">
                <p>{challengesError}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {joinedChallenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className="bg-white p-6 shadow-lg rounded-lg flex flex-col space-y-4"
                  >
                    <h3 className="text-lg font-semibold">{challenge.title}</h3>
                    <p className="text-gray-600">{challenge.description}</p>
                    <div className="text-sm text-gray-500">
                      <p>
                        <strong>Start:</strong> {new Date(challenge.start_date).toLocaleDateString("sv-SE")}
                      </p>
                      <p>
                        <strong>End:</strong> {new Date(challenge.end_date).toLocaleDateString("sv-SE")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
