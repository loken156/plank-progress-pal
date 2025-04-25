// src/pages/Profile.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UserStats from "@/components/UserStats";
import AchievementBadges from "@/components/AchievementBadges";
import ProfileHeader, { ProfileData } from "@/components/ProfileHeader";
import PlankHistory, { PlankEntry } from "@/components/PlankHistory";
import ProgressGraph from "@/components/ProfileGraph";
import { toast } from "@/components/ui/sonner";

const ProfilePage: React.FC = () => {
    const { id: profileId } = useParams<{ id: string }>();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [planks, setPlanks] = useState<PlankEntry[]>([]);
    const [loggedInId, setLoggedInId] = useState<string>("");
    const navigate = useNavigate();

    useEffect(() => {
        if (!profileId) {
            // no id in URL → redirect to your own profile
            navigate("/profile/" + loggedInId);
            return;
        }

        async function load() {
            // 1) Get logged-in user
            const {
                data: { user },
                error: userErr,
            } = await supabase.auth.getUser();
            if (userErr || !user) {
                navigate("/auth");
                return;
            }
            setLoggedInId(user.id);

            // 2) Fetch the requested user's profile
            const { data: row, error } = await supabase
                .from("profiles")
                .select(
                    "full_name,username,profile_image,bio,join_date,followers_count"
                )
                .eq("id", profileId)
                .single();

            if (error || !row) {
                toast.error("Could not load that profile.");
                return;
            }

            setProfile({
                name: row.full_name,
                username: row.username,
                profileImage: row.profile_image,
                bio: row.bio,
                joinDate: row.join_date,
                followersCount: row.followers_count,
            });

            // 3) Fetch last 5 planks for that user
            const { data: rawPlanks, error: plankErr } = await supabase
                .from<{ id: number; plank_date: string; duration_s: number }>(
                    "planks"
                )
                .select("id, plank_date, duration_s")
                .eq("user_id", profileId)
                .order("plank_date", { ascending: false })
                .limit(5);

            if (plankErr) {
                console.error(plankErr);
                return;
            }

            // 4) Map into UI shape (day labels in English)
            const mapped = (rawPlanks || []).map((p) => {
                const d = new Date(p.plank_date);
                const today = new Date();
                const yesterday = new Date();
                yesterday.setDate(today.getDate() - 1);

                let dayLabel: string;
                if (d.toDateString() === today.toDateString()) {
                    dayLabel = "Today";
                } else if (d.toDateString() === yesterday.toDateString()) {
                    dayLabel = "Yesterday";
                } else {
                    dayLabel =
                        d.toLocaleDateString("en-US", { weekday: "long" }).replace(
                            /^\w/,
                            (c) => c.toUpperCase()
                        );
                }

                const dateDisplay = d.toLocaleDateString("en-US", {
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
    }, [profileId, navigate]);

    // Only allow profile editing if it’s **your** profile
    const handleSave = async (updates: Partial<ProfileData>) => {
        if (!profileId || loggedInId !== profileId) return;

        const { error } = await supabase
            .from("profiles")
            .update({
                full_name: updates.name,
                profile_image: updates.profileImage,
                bio: updates.bio,
            })
            .eq("id", profileId);

        if (error) {
            toast.error("Could not save changes.");
        } else {
            setProfile((p) => p && { ...p, ...updates });
            toast.success("Profile updated!");
        }
    };

    if (!profile) {
        return <div className="p-8 text-center">Loading profile…</div>;
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <main className="flex-grow bg-gray-50">
                <ProfileHeader
                    data={profile}
                    onSave={handleSave}
                    // optionally pass a prop to hide the “Edit” button
                    canEdit={loggedInId === profileId}
                />

                <div className="container mx-auto py-8 px-6 space-y-12">
                    <section>
                        <h2 className="text-xl font-semibold mb-4">My Statistics</h2>
                        <UserStats userId={profileId} />
                    </section>

                    <h2 className="text-xl font-semibold mb-4">Plank History</h2>
                    <PlankHistory
                        userId={profileId}              // ← pass the ID from useParams
                        onViewAll={() => navigate("/history")}
                    />

                    <section>
                        <h2 className="text-xl font-semibold mb-4">My Progress</h2>
                        <ProgressGraph userId={profileId} />
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ProfilePage;
