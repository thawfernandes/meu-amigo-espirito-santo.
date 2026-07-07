const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = "https://jmtavlozxkmkeubekbjd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptdGF2bG96eGtta2V1YmVrYmpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxNzcwMzAsImV4cCI6MjA5Nzc1MzAzMH0.HW6-OjuevWDfnR2C5aJHthKpH0jBfx7R7vU_R3pznM8";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  console.log("Testing fetch notebooks...");
  const { data: nbs, error: errFetch } = await supabase
    .from("study_notebooks")
    .select("*")
    .limit(1);
    
  if (errFetch) {
    console.error("Fetch error:", errFetch);
  } else {
    console.log("Fetch success:", nbs);
  }

  console.log("Testing insert...");
  const { data, error } = await supabase
    .from("study_notebooks")
    .insert({
      user_id: "00000000-0000-0000-0000-000000000000",
      title: "Test Notebook",
      description: "Test",
      category: "Geral",
      status: "progress",
      is_favorite: false
    });
    
  if (error) {
    console.error("Insert error:", error);
  } else {
    console.log("Insert success:", data);
  }
}

test();
