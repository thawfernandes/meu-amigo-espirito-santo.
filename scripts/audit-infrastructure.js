import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Carregar variáveis de ambiente
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

const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ ERRO: Variáveis de ambiente do Supabase ausentes.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runAudit() {
  console.log("=========================================");
  console.log("🔍 INICIANDO AUDITORIA DE INFRAESTRUTURA");
  console.log("=========================================\n");

  let allPassed = true;

  // 1. Verificar Tabela e Expansão da Cápsula do Tempo
  console.log("⏳ Testando Cápsula do Tempo (Sincronização & Expansão)...");
  try {
    const testUserId = "00000000-0000-0000-0000-000000000000"; // UUID fake
    // Clean up before test
    await supabase
      .from("time_capsules")
      .delete()
      .eq("user_id", testUserId)
      .eq("month_year", "2000-01");

    const payload = {
      user_id: testUserId,
      month_year: "2000-01",
      blessings: ["Teste"],
      objectives: ["Aprender"],
      free_notes: ["Nota livre"],
      photos: ["url-fake"],
    };

    const { error: insertErr } = await supabase.from("time_capsules").upsert(payload);
    if (insertErr) throw new Error("Erro no upsert: " + insertErr.message);

    const { data: readData, error: readErr } = await supabase
      .from("time_capsules")
      .select("*")
      .eq("user_id", testUserId)
      .eq("month_year", "2000-01")
      .single();

    if (readErr || !readData) throw new Error("Erro na leitura após gravação");
    if (!readData.objectives || readData.objectives[0] !== "Aprender")
      throw new Error("Coluna objectives falhou na expansão JSONB");

    console.log("✅ Cápsula do Tempo estruturada e respondendo corretamente (Read/Write).");

    // Clean up
    await supabase.from("time_capsules").delete().eq("user_id", testUserId);
  } catch (err) {
    console.log("❌ Falha na Cápsula do Tempo:", err.message);
    allPassed = false;
  }

  // 2. Verificar Histórico de Anotações e Triggers
  console.log("\n⏳ Testando Histórico de Anotações (Tabela & Triggers)...");
  try {
    const testUserId = "00000000-0000-0000-0000-000000000000";

    // Inserir anotação base
    const { data: note, error: insertErr } = await supabase
      .from("verse_notes")
      .insert({
        user_id: testUserId,
        version: "GLOBAL",
        book: "Gênesis",
        chapter: 1,
        verse: 999,
        content: "Versão 1",
      })
      .select()
      .single();

    if (insertErr) throw new Error("Erro ao inserir anotação inicial: " + insertErr.message);

    // Atualizar anotação (deve disparar o trigger)
    const { error: updateErr } = await supabase
      .from("verse_notes")
      .update({ content: "Versão 2" })
      .eq("id", note.id);

    if (updateErr) throw new Error("Erro ao atualizar anotação: " + updateErr.message);

    // Validar se gerou histórico
    const { data: history, error: histErr } = await supabase
      .from("verse_notes_history")
      .select("*")
      .eq("note_id", note.id);

    if (histErr) throw new Error("Erro ao ler tabela verse_notes_history: " + histErr.message);
    if (!history || history.length === 0)
      throw new Error("O Trigger NÃO gravou a versão anterior na tabela de histórico.");
    if (history[0].content !== "Versão 1")
      throw new Error(`O conteúdo salvo no histórico não confere (salvou: ${history[0].content}).`);

    console.log(
      "✅ Histórico de Anotações e Triggers estão perfeitos (A versão anterior foi arquivada automaticamente).",
    );

    // Clean up
    await supabase.from("verse_notes").delete().eq("id", note.id);
  } catch (err) {
    console.log("❌ Falha no Histórico de Anotações:", err.message);
    if (err.message.includes('relation "public.verse_notes_history" does not exist')) {
      console.log("   -> A migração SQL não foi rodada ou falhou.");
    }
    allPassed = false;
  }

  // 3. Verificar Supabase Storage (Mídias)
  console.log("\n⏳ Testando Supabase Storage (Bucket capsule-media)...");
  try {
    const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
    if (bErr) throw new Error("Erro ao listar buckets: " + bErr.message);

    const mediaBucket = buckets.find((b) => b.name === "capsule-media");
    if (!mediaBucket) throw new Error("O bucket 'capsule-media' NÃO foi encontrado.");

    // Upload de teste
    const testFileName = "test-audit-" + Date.now() + ".txt";
    const { error: uploadErr } = await supabase.storage
      .from("capsule-media")
      .upload(testFileName, "teste-123", {
        contentType: "text/plain",
      });

    if (uploadErr) {
      if (uploadErr.message.includes("row-level security")) {
        throw new Error(
          "Erro de RLS - As políticas do bucket podem estar impedindo o service_role ou o upload.",
        );
      }
      throw new Error("Erro no upload: " + uploadErr.message);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("capsule-media").getPublicUrl(testFileName);
    if (!publicUrl) throw new Error("Falha ao gerar URL pública.");

    console.log(
      "✅ Supabase Storage operando 100%. Bucket 'capsule-media' existe e aceita uploads.",
    );

    // Clean up
    await supabase.storage.from("capsule-media").remove([testFileName]);
  } catch (err) {
    console.log("❌ Falha no Supabase Storage:", err.message);
    allPassed = false;
  }

  console.log("\n=========================================");
  if (allPassed) {
    console.log("🎉 AUDITORIA CONCLUÍDA COM SUCESSO!");
    console.log("Todas as modificações da fase 2 estão estáveis e prontas para uso.");
  } else {
    console.log("🚨 AUDITORIA CONCLUÍDA COM ERROS.");
    console.log("Por favor, verifique se rodou 'npx supabase db push' ou corrija os erros acima.");
  }
  console.log("=========================================\n");
}

runAudit();
