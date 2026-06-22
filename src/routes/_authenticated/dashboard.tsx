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
}
interface Walk {
  percent: number;
  streak_days: number;
}

function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [walk, setWalk] = useState<Walk>({ percent: 12, streak_days: 0 });

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data: p } = await supabase
        .from("profiles")
        .select("display_name, onboarding_completed")
        .eq("id", u.user.id)
        .maybeSingle();
      setProfile(p as Profile | null);
      if (p && !p.onboarding_completed) {
        window.location.href = "/onboarding";
        return;
      }
      const { data: w } = await supabase
        .from("walk_progress")
        .select("percent, streak_days")
        .eq("user_id", u.user.id)
        .maybeSingle();
      if (w) setWalk(w as Walk);
      else await supabase.from("walk_progress").insert({ user_id: u.user.id });
    })();
  }, []);

  const firstName = profile?.display_name?.split(" ")[0] ?? "amigo";

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <GameWorld
      userName={firstName}
      percent={walk.percent}
      streak={walk.streak_days}
      onLogout={logout}
    />
  );
}
