import { supabase } from "@/integrations/supabase/client";

export async function logActivity(userId: string, kind: string, payload: any) {
  try {
    const { error } = await supabase.from("activity_log").insert({
      user_id: userId,
      kind,
      payload,
    });
    if (error) {
      console.warn("Failed to log activity to Supabase, saving locally:", error);
      saveLocalActivity(userId, kind, payload);
    }
  } catch (err) {
    console.error("Exception in logActivity:", err);
    saveLocalActivity(userId, kind, payload);
  }
}

function saveLocalActivity(userId: string, kind: string, payload: any) {
  try {
    const key = `local_activities_${userId}`;
    const stored = localStorage.getItem(key);
    const activities = stored ? JSON.parse(stored) : [];
    activities.unshift({
      id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      kind,
      payload,
      created_at: new Date().toISOString(),
    });
    localStorage.setItem(key, JSON.stringify(activities.slice(0, 100)));
  } catch (e) {
    console.error("Failed to save local activity:", e);
  }
}

export function getLocalActivities(userId: string): any[] {
  try {
    const key = `local_activities_${userId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}
