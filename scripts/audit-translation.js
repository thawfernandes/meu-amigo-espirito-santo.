import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// 1. Manually parse .env to avoid extra dependencies
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

const supabaseUrl = process.env.SUPABASE_URL || env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  env.SUPABASE_PUBLISHABLE_KEY ||
  env.VITE_SUPABASE_ANON_KEY ||
  env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Erro: Variáveis de ambiente Supabase ausentes.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const CACHE_DIR = path.resolve(process.cwd(), "scripts", ".cache");

async function fetchAcfBible() {
  const cacheFile = path.join(CACHE_DIR, "acf.json");
  if (fs.existsSync(cacheFile)) {
    return JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
  }
  const url = "https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/acf.json";
  const res = await fetch(url);
  const data = await res.json();
  fs.writeFileSync(cacheFile, JSON.stringify(data));
  return data;
}

async function runAudit() {
  console.log("Iniciando auditoria independente da tradução...");

  const acfBible = await fetchAcfBible();
  let totalExpectedChapters = 1189;
  let totalExpectedVerses = 0;

  const expectedStructure = {};
  acfBible.forEach((book) => {
    const abbr = book.abbrev.toLowerCase() === "atos" ? "at" : book.abbrev.toLowerCase();
    expectedStructure[abbr] = {
      name: book.name,
      chapters: book.chapters.length,
      versesPerChapter: book.chapters.map((c) => Object.keys(c).length),
    };
    book.chapters.forEach((c) => {
      totalExpectedVerses += Object.keys(c).length;
    });
  });

  console.log(`Bíblia Base (ACF): Mapeamento OK. Capítulos: ${totalExpectedChapters} | Versículos: ${totalExpectedVerses}`);

  // 1. Fetch translation_jobs
  console.log("Buscando estado dos Jobs do Supabase...");
  const { data: jobs, error: jobsError } = await supabase
    .from("translation_jobs")
    .select("*")
    .order("id", { ascending: true });

  if (jobsError) {
    console.error("Erro ao buscar jobs do Supabase:", jobsError);
    process.exit(1);
  }

  console.log(`Jobs encontrados: ${jobs.length} / ${totalExpectedChapters}`);

  // 2. Fetch all translated verses in pages of 5000
  console.log("Baixando versículos traduzidos de original_bible_verses...");
  let allVerses = [];
  let page = 0;
  const pageSize = 5000;
  let fetching = true;

  while (fetching) {
    const { data, error } = await supabase
      .from("original_bible_verses")
      .select("book_abbr, chapter, verse, text, key_words, original_lang")
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error("Erro ao buscar versículos:", error);
      process.exit(1);
    }

    if (data.length === 0) {
      fetching = false;
    } else {
      allVerses.push(...data);
      page++;
    }
  }

  console.log(`Download concluído. Processando ${allVerses.length} versículos traduzidos...`);

  // Build local maps for verification
  const dbVersesMap = {}; // { 'gn_1_1': verse }
  const duplicates = [];
  const invalidStructure = [];
  const parentheticalViolations = [];
  const keywordViolations = [];

  allVerses.forEach((v) => {
    const key = `${v.book_abbr}_${v.chapter}_${v.verse}`;
    
    if (dbVersesMap[key]) {
      duplicates.push(key);
    }
    dbVersesMap[key] = v;

    // Check parenthetical violations
    if (v.text && (v.text.includes("(") || v.text.includes(")"))) {
      parentheticalViolations.push(`${v.book_abbr} ${v.chapter}:${v.verse}`);
    }

    // Check empty text
    if (!v.text || v.text.trim() === "") {
      invalidStructure.push(`${v.book_abbr} ${v.chapter}:${v.verse} - Texto vazio`);
    }

    // Check keywords mapping consistency
    const textMatches = [...(v.text || "").matchAll(/\{\{(.*?)\}\}/g)].map((m) => m[1]);
    const kwTerms = (v.key_words || []).map((k) => k.term);
    
    for (const term of textMatches) {
      if (!kwTerms.includes(term)) {
        keywordViolations.push(`${v.book_abbr} ${v.chapter}:${v.verse} - Termo "{{${term}}}" ausente no key_words`);
      }
    }
  });

  // Cross-reference with jobs list
  let missingChapters = [];
  let partiallyTranslatedChapters = [];
  let jobStateMismatches = [];
  let failedJobs = [];
  let rateLimitedJobs = [];

  jobs.forEach((job) => {
    const exp = expectedStructure[job.book];
    if (!exp) return;

    const expectedVerses = exp.versesPerChapter[job.chapter - 1];
    
    // Count actual verses in db
    let countInDb = 0;
    for (let v = 1; v <= expectedVerses; v++) {
      if (dbVersesMap[`${job.book}_${job.chapter}_${v}`]) {
        countInDb++;
      }
    }

    // Check status consistency
    if (job.status === "completed") {
      if (countInDb !== expectedVerses) {
        jobStateMismatches.push(`${job.book} ${job.chapter} - Marcado COMPLETED mas tem ${countInDb}/${expectedVerses} no banco.`);
      }
    } else if (countInDb === expectedVerses) {
      jobStateMismatches.push(`${job.book} ${job.chapter} - Status é '${job.status}' mas todos os ${expectedVerses} versículos já estão no banco.`);
    } else if (countInDb > 0 && job.status !== "processing") {
      partiallyTranslatedChapters.push(`${job.book} ${job.chapter} - Parcialmente traduzido (${countInDb}/${expectedVerses} versos). Status do job: ${job.status}`);
    }

    if (job.status === "failed") {
      failedJobs.push(`${job.book} ${job.chapter} (Erro: ${job.last_error || "Desconhecido"})`);
    } else if (job.status === "rate_limited") {
      rateLimitedJobs.push(`${job.book} ${job.chapter} (Tentativas: ${job.attempts})`);
    } else if (job.status === "pending" && countInDb === 0) {
      // Just normal pending, do nothing
    }
  });

  // Check for completely missing chapters
  for (const book of Object.keys(expectedStructure)) {
    const expBook = expectedStructure[book];
    for (let c = 1; c <= expBook.chapters; c++) {
      const expectedVerses = expBook.versesPerChapter[c - 1];
      let hasAny = false;
      for (let v = 1; v <= expectedVerses; v++) {
        if (dbVersesMap[`${book}_${c}_${v}`]) {
          hasAny = true;
          break;
        }
      }
      
      const job = jobs.find(j => j.book === book && j.chapter === c);
      if (!hasAny && (!job || job.status === "pending")) {
        missingChapters.push(`${expBook.name} ${c}`);
      }
    }
  }

  console.log("\n====== RELATÓRIO DE AUDITORIA ======");
  console.log(`✓ Capítulos concluídos e salvos: ${jobs.filter(j => j.status === 'completed').length} / ${totalExpectedChapters}`);
  console.log(`✓ Total de versículos no banco: ${allVerses.length} / ${totalExpectedVerses}`);
  
  console.log(`\n[Duplicidades]: ${duplicates.length}`);
  if (duplicates.length > 0) console.log(duplicates.slice(0, 10));

  console.log(`\n[Capítulos Faltantes]: ${missingChapters.length}`);
  if (missingChapters.length > 0) console.log(missingChapters.slice(0, 20));

  console.log(`\n[Capítulos Parciais]: ${partiallyTranslatedChapters.length}`);
  if (partiallyTranslatedChapters.length > 0) console.log(partiallyTranslatedChapters.slice(0, 10));

  console.log(`\n[Jobs com Falha (FAILED)]: ${failedJobs.length}`);
  if (failedJobs.length > 0) console.log(failedJobs.slice(0, 10));

  console.log(`\n[Jobs Bloqueados por Rate Limit (RATE_LIMITED)]: ${rateLimitedJobs.length}`);
  if (rateLimitedJobs.length > 0) console.log(rateLimitedJobs.slice(0, 10));

  console.log(`\n[Inconsistências de Estado do Job]: ${jobStateMismatches.length}`);
  if (jobStateMismatches.length > 0) console.log(jobStateMismatches.slice(0, 10));

  console.log(`\n[Violações de Regra de Parênteses]: ${parentheticalViolations.length}`);
  if (parentheticalViolations.length > 0) console.log(parentheticalViolations.slice(0, 10));

  console.log(`\n[Violações de Mapeamento de Chaves/Palavras-Chave]: ${keywordViolations.length}`);
  if (keywordViolations.length > 0) console.log(keywordViolations.slice(0, 10));

  console.log("\n====================================");
  
  const hasErrors = 
    duplicates.length > 0 || 
    partiallyTranslatedChapters.length > 0 ||
    jobStateMismatches.length > 0 ||
    parentheticalViolations.length > 0 ||
    keywordViolations.length > 0 ||
    failedJobs.length > 0;

  if (hasErrors) {
    console.error("❌ STATUS DA AUDITORIA: INCONSISTÊNCIAS OU ERROS ENCONTRADOS!");
    process.exit(1);
  } else {
    console.log("✅ STATUS DA AUDITORIA: TUDO EM ORDEM! Nenhuma inconsistência encontrada.");
    process.exit(0);
  }
}

runAudit();
