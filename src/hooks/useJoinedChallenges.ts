// src/hooks/useJoinedChallenges.ts
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// This is the shape of each joined challenge you'll expose to your component
export interface JoinedChallenge {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
}

// This matches exactly the row Supabase returns when you join challenge_participants → challenges
interface ChallengeParticipantRow {
  challenge_id: number;
  challenges: JoinedChallenge | null;
  user_id: string; // Assuming you are associating challenges with users, add user_id if needed
}

export function useJoinedChallenges(userId: string) {
  const [joinedChallenges, setJoinedChallenges] = useState<JoinedChallenge[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setJoinedChallenges([]);
      return;
    }

    const loadChallenges = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchErr } = await supabase
        .from<ChallengeParticipantRow>("challenge_participants")
        .select(
          `challenge_id, 
           challenges (
             id, 
             title, 
             description, 
             start_date, 
             end_date
           )`
        )
        .eq("user_id", userId);

      if (fetchErr) {
        console.error(fetchErr);
        setError("Kunde inte hämta utmaningar");
      } else if (data) {
        // Filter out any null relationships, then map to JoinedChallenge
        const parsed = data
          .filter(
            (row): row is ChallengeParticipantRow & { challenges: JoinedChallenge } =>
              row.challenges !== null
          )
          .map((row) => row.challenges);

        setJoinedChallenges(parsed);
      }

      setLoading(false);
    };

    loadChallenges();
  }, [userId]);

  return { joinedChallenges, loading, error };
}
