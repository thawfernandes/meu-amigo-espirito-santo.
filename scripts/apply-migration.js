// Script para aplicar a migration de workflow_executions diretamente no Supabase
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const envPath = path.resolve(process.cwd(), ".env");
const env = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?s*$/);
    if (match) {
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      env[match[1]] = value;
    }
  });
}

const supabaseUrl = process.env.SUPABASE_URL || env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Conectando ao Supabase:", supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

// Apply migration SQL using Supabase REST API (execute raw SQL via pg_dump approach)
// Since Supabase JS doesn't expose raw SQL execution directly for DDL,
// we'll use the management API or the REST endpoint for SQL execution

const migrationSQL = fs.readFileSync(
  path.resolve(process.cwd(), "supabase/migrations/20260826000000_workflow_executions.sql"),
  "utf-8"
);

// Try using the supabase management REST API
const projectId = env.SUPABASE_PROJECT_ID || env.VITE_SUPABASE_PROJECT_ID;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

async function applyMigration() {
  // Use the Supabase SQL endpoint (available for service role)
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": serviceRoleKey,
      "Authorization": `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify({ sql: migrationSQL }),
  });
  
  if (!response.ok) {
    // If the RPC exec_sql doesn't exist, try using pg directly via the Supabase Admin API
    console.log("RPC exec_sql não disponível, tentando método alternativo...");
    
    // Test if the table already exists
    const { data, error } = await supabase
      .from("workflow_executions")
      .select("id")
      .limit(1);
    
    if (!error) {
      console.log("✓ Tabela workflow_executions já existe!");
      return true;
    }
    
    console.error("A tabela não existe e não foi possível criar automaticamente.");
    console.log("Execute manualmente o SQL no Supabase Dashboard:");
    console.log("https://supabase.com/dashboard/project/" + projectId + "/sql");
    return false;
  }
  
  const result = await response.json();
  console.log("Migration aplicada com sucesso:", result);
  return true;
}

applyMigration().then(success => {
  if (success) {
    console.log("✓ Sistema de rastreamento de execuções pronto!");
  }
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error("Erro:", err);
  process.exit(1);
});
