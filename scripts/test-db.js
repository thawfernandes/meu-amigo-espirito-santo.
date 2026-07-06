import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve(process.cwd(), '.env');
const env = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split(/\r?\n/).forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      env[match[1]] = value;
    }
  });
}

const supabaseUrl = process.env.SUPABASE_URL || env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY;

console.log("Supabase URL configured:", supabaseUrl ? supabaseUrl.split('.')[0] + "..." : "NOT FOUND");
console.log("Supabase Key configured (first 10 chars):", supabaseKey ? supabaseKey.substring(0, 10) + "..." : "NOT FOUND");

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log("Executando leitura via API (PostgREST)...");
  
  const { data: d1, error: e1 } = await supabase.from('original_bible_verses').select('*').limit(1);
  console.log("\n--- TESTE 1: Tabela original_bible_verses ---");
  if (e1) console.error("ERRO:", e1.message);
  else console.log("SUCESSO:", d1);

  const { data: d2, error: e2 } = await supabase.from('uma_tabela_que_nao_existe_123').select('*').limit(1);
  console.log("\n--- TESTE 2: Tabela uma_tabela_que_nao_existe_123 ---");
  if (e2) console.error("ERRO:", e2.message);
  else console.log("SUCESSO:", d2);
}

testConnection();
