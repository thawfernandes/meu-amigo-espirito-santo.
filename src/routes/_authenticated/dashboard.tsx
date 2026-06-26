import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GameWorld } from "@/components/game/GameWorld";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

interface Profile {
  display_name: string | null;
  onboarding_completed: boolean;
  quiz_profile?: string; // from onboarding quiz
  created_at: string;
}

interface LevelInfo {
  level: number;
  levelName: string;
  currentLevelXp: number;
  nextLevelXp: number;
  pct: number;
  xpNeeded: number;
  totalXp: number;
}

// Leveling curve and titles helper
export function calculateLevel(xp: number): LevelInfo {
  const thresholds = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000, 5000, 6500, 8000, 10000];
  const levelNames = [
    "Semeando a Palavra",
    "Semeando a Palavra", // Lvl 1
    "Aprendendo a Caminhar", // Lvl 2
    "Raízes na Fé", // Lvl 3
    "Crescendo em Graça", // Lvl 4
    "Caminhante Fiel", // Lvl 5
    "Testemunha da Palavra", // Lvl 6
    "Servo Vigilante", // Lvl 7
    "Firmado na Rocha", // Lvl 8
    "Discipulador", // Lvl 9
    "Aprofundado na Palavra", // Lvl 10
    "Teólogo do Amor", // Lvl 11
    "Embaixador de Cristo", // Lvl 12
    "Vaso Escolhido", // Lvl 13
    "Maturidade Plena", // Lvl 14
    "Sábio Conselheiro" // Lvl 15+
  ];

  let level = 1;
  while (level < thresholds.length - 1 && xp >= thresholds[level]) {
    level++;
  }

  if (level >= thresholds.length - 1 && xp >= thresholds[thresholds.length - 1]) {
    const maxLvl = thresholds.length - 1;
    return {
      level: maxLvl,
      levelName: levelNames[maxLvl] || "Caminhada Infinita",
      currentLevelXp: xp - thresholds[maxLvl - 1],
      nextLevelXp: 1000,
      pct: 100,
      xpNeeded: 0,
      totalXp: xp
    };
  }

  const minXp = thresholds[level - 1];
  const maxXp = thresholds[level];
  const levelRange = maxXp - minXp;
  const currentLevelXp = xp - minXp;
  const pct = Math.round((currentLevelXp / levelRange) * 100);
  const xpNeeded = maxXp - xp;

  return {
    level: level - 1 || 1,
    levelName: levelNames[level - 1] || "Aprendiz",
    currentLevelXp,
    nextLevelXp: levelRange,
    pct,
    xpNeeded,
    totalXp: xp
  };
}

function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [streakDays, setStreakDays] = useState(0);
  const [walkPercent, setWalkPercent] = useState(0);
  const [levelInfo, setLevelInfo] = useState<LevelInfo>({
    level: 1,
    levelName: "Semeando a Palavra",
    currentLevelXp: 0,
    nextLevelXp: 100,
    pct: 0,
    xpNeeded: 100,
    totalXp: 0
  });

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const userId = u.user.id;

      // Load Profile
      const { data: p } = await supabase
        .from("profiles")
        .select("display_name, onboarding_completed, created_at, theme")
        .eq("id", userId)
        .maybeSingle();
      
      const userProfile = p as Profile | null;
      setProfile(userProfile);

      if (userProfile && !userProfile.onboarding_completed) {
        window.location.href = "/onboarding";
        return;
      }

      // Load walk progress
      const { data: w } = await supabase
        .from("walk_progress")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      
      let walkData = w;
      if (!walkData) {
        const { data: inserted } = await supabase
          .from("walk_progress")
          .insert({ user_id: userId })
          .select()
          .single();
        walkData = inserted;
      }

      // Load other activities from Supabase to compute XP
      const { count: notesCount } = await supabase
        .from("verse_notes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      const { count: highlightsCount } = await supabase
        .from("highlights")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      // Load local storage values
      const correctAnswersCount = Number(localStorage.getItem("bible.stats.correctAnswersCount") || "0");
      const completedMonthlyChallenges = JSON.parse(localStorage.getItem(`local_monthly_challenges_${userId}`) || "[]");

      // Determine initial XP offset based on Quiz Profile
      // beginner = Lvl 1 (0 XP)
      // walking = Lvl 3 (250 Base XP)
      // deepening = Lvl 5 (700 Base XP)
      const userQuizProfile = u.user.user_metadata?.quiz_profile || "beginner";
      let baseOffset = 0;
      if (userQuizProfile === "walking") baseOffset = 250;
      else if (userQuizProfile === "deepening") baseOffset = 700;

      // Calculate Total XP
      // - Chapter read: 15 XP
      // - Note created: 10 XP
      // - Highlight marked: 5 XP
      // - Prayer registered: 15 XP
      // - Study/Notebook completed: 50 XP
      // - Challenge completed: 100 XP
      // - Correct quiz answer: 10 XP
      // - Streak: 20 XP per consecutive day
      const chaptersRead = walkData?.chapters_read || 0;
      const prayersCount = walkData?.prayers_count || 0;
      const studiesCount = walkData?.studies_count || 0;
      const challengesDone = walkData?.challenges_done || 0;
      const streak = walkData?.streak_days || 0;

      const totalXp = 
        baseOffset +
        (chaptersRead * 15) +
        (studiesCount * 50) +
        (correctAnswersCount * 10) +
        (completedMonthlyChallenges.length * 100) +
        ((notesCount || 0) * 10) +
        ((highlightsCount || 0) * 5) +
        (prayersCount * 15) +
        (streak * 20);

      const computedLevel = calculateLevel(totalXp);
      setLevelInfo(computedLevel);
      setStreakDays(streak);
      setWalkPercent(walkData?.percent || 0);

      // Sync computed level progress back to walk_progress percent
      if (walkData && walkPercent !== computedLevel.pct) {
        await supabase
          .from("walk_progress")
          .update({ percent: computedLevel.pct })
          .eq("user_id", userId);
      }

      // Check-in and update consecutive access days (streak)
      const todayStr = new Date().toISOString().split("T")[0];
      const lastActiveStr = walkData?.last_active_date;
      
      if (lastActiveStr !== todayStr) {
        let newStreak = 1;
        if (lastActiveStr) {
          const lastActiveDate = new Date(lastActiveStr + "T12:00:00");
          const currentDate = new Date(todayStr + "T12:00:00");
          const diffTime = Math.abs(currentDate.getTime() - lastActiveDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            newStreak = (walkData?.streak_days || 0) + 1;
          }
        }
        
        await supabase
          .from("walk_progress")
          .update({ 
            last_active_date: todayStr, 
            streak_days: newStreak 
          })
          .eq("user_id", userId);
        setStreakDays(newStreak);
      }

      // Comparison and Real-Time Mascot Celebration
      const prevStatsRaw = sessionStorage.getItem("bible.prev_stats");
      if (prevStatsRaw && walkData) {
        const prev = JSON.parse(prevStatsRaw);
        
        if (walkData.chapters_read > prev.chapters_read) {
          setTimeout(() => {
            if ((window as any).__lumiCelebrate) {
              (window as any).__lumiCelebrate("Parabéns por ler a Palavra! Vamos para o próximo? 📖✨", "excited");
            }
          }, 1200);
        } else if (walkData.prayers_count > prev.prayers_count) {
          setTimeout(() => {
            if ((window as any).__lumiCelebrate) {
              (window as any).__lumiCelebrate("Sua oração subiu ao trono da graça! 🙏✨", "pray");
            }
          }, 1200);
        } else if (walkData.studies_count > prev.studies_count) {
          setTimeout(() => {
            if ((window as any).__lumiCelebrate) {
              (window as any).__lumiCelebrate("Que incrível! Estudo concluído! 📚✨", "celebrate");
            }
          }, 1200);
        } else if (walkData.challenges_done > prev.challenges_done) {
          setTimeout(() => {
            if ((window as any).__lumiCelebrate) {
              (window as any).__lumiCelebrate("Glória a Deus! Mais um desafio concluído! ❤️✨", "celebrate");
            }
          }, 1200);
        }
      }

      // Save stats for next comparison
      if (walkData) {
        sessionStorage.setItem("bible.prev_stats", JSON.stringify({
          chapters_read: walkData.chapters_read,
          prayers_count: walkData.prayers_count,
          studies_count: walkData.studies_count,
          challenges_done: walkData.challenges_done
        }));
      }
    })();
  }, [walkPercent]);

  const firstName = profile?.display_name?.split(" ")[0] ?? "amigo";

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <GameWorld
      userName={firstName}
      percent={levelInfo.pct}
      streak={streakDays}
      onLogout={logout}
      levelInfo={levelInfo}
      lastActiveDate={profile?.created_at}
    />
  );
}
