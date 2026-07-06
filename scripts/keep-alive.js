import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing Supabase credentials in environment variables.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  console.log("Starting Supabase Keep-Alive ping...");

  try {
    // 1. Tentar atualizar a tabela system_health
    console.log("Tentando atualizar a tabela system_health...");
    const { data, error } = await supabase
      .from('system_health')
      .update({ last_heartbeat: new Date().toISOString() })
      .eq('id', 'main')
      .select();

    if (error) {
      if (error.code === '42P01') { // 42P01 is relation does not exist in Postgres
        console.warn("A tabela system_health não foi encontrada. Você aplicou as migrations no Supabase?");
        console.warn("Não se preocupe! O ping secundário manterá o banco ativo.");
      } else {
        console.error("Erro ao atualizar system_health:", error);
      }
    } else {
      console.log("Heartbeat registrado com sucesso em system_health:", data);
    }

    // 2. Fallback de garantia: Fazer um simples ping em qualquer tabela existente (ex: profiles)
    // Isso garante que mesmo se o usuário não aplicou a migration, o banco recebe uma request da API REST.
    console.log("Realizando ping de segurança na tabela profiles...");
    const { error: pingError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (pingError) {
      console.error("Erro no ping de segurança:", pingError);
      process.exit(1);
    }

    console.log("Keep-Alive concluído com sucesso!");
    process.exit(0);

  } catch (err) {
    console.error("Exceção inesperada:", err);
    process.exit(1);
  }
}

run();
