import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const envPath = path.resolve(process.cwd(), ".env");
const env = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      env[match[1]] = value;
    }
  });
}

const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  console.log("=== INSPEÇÃO DO SUPABASE ===");
  
  // 1. system_health
  const { data: health, error: healthErr } = await supabase.from("system_health").select("*");
  console.log("system_health:", healthErr ? healthErr.message : health);
  
  // 2. translation_jobs status counts
  const { data: jobs, error: jobsErr } = await supabase.from("translation_jobs").select("status");
  if (jobsErr) {
    console.error("translation_jobs error:", jobsErr);
  } else {
    const summary = {};
    jobs.forEach(j => summary[j.status] = (summary[j.status] || 0) + 1);
    console.log("translation_jobs status counts:", summary);
    console.log("Total jobs:", jobs.length);
  }

  // 3. verses count
  const { count: verseCount } = await supabase.from("original_bible_verses").select("*", { count: "exact", head: true });
  console.log("original_bible_verses count:", verseCount);

  // 4. last updated jobs
  const { data: lastJobs } = await supabase
    .from("translation_jobs")
    .select("book, chapter, status, attempts, last_error, updated_at")
    .order("updated_at", { ascending: false })
    .limit(5);
  console.log("Últimos jobs atualizados:", lastJobs);
}

inspect();
