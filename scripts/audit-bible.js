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

const supabaseUrl = process.env.SUPABASE_URL || env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  env.SUPABASE_PUBLISHABLE_KEY ||
  env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchAcfBible() {
  const url = "https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/acf.json";
  const res = await fetch(url);
  return res.json();
}

async function runAudit() {
  console.log("Iniciando auditoria completa da tradução...");

  const acfBible = await fetchAcfBible();
  let totalExpectedVerses = 0;
  let totalExpectedChapters = 1189;

  const expectedStructure = {};
  acfBible.forEach((book) => {
    expectedStructure[book.abbrev.toLowerCase()] = {
      chapters: book.chapters.length,
      versesPerChapter: book.chapters.map((c) => Object.keys(c).length),
    };
    book.chapters.forEach((c) => {
      totalExpectedVerses += Object.keys(c).length;
    });
  });

  console.log(
    `Bíblia Base (ACF) mapeada. Total de Capítulos: ${totalExpectedChapters} | Total de Versículos: ${totalExpectedVerses}`,
  );

  const { count: actualCount, error: countError } = await supabase
    .from("original_bible_verses")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("Erro ao contar versículos no banco:", countError);
    return;
  }

  console.log(`\nRegistros encontrados no banco: ${actualCount} / ${totalExpectedVerses}`);

  if (actualCount !== totalExpectedVerses) {
    console.log("⚠️ ATENÇÃO: A quantidade de versículos no banco difere da esperada.");
  } else {
    console.log("✅ Quantidade total de versículos bate perfeitamente.");
  }

  // Checking distinct chapters
  const { data: chaptersData, error: chaptersError } = await supabase.rpc("get_distinct_chapters"); // we might not have this RPC, let's just fetch everything grouped if possible, or fetch all and process in memory since it's only ~31000 rows.

  // Since fetching 31000 rows might be heavy, we'll fetch them in pages.
  let allVerses = [];
  let page = 0;
  const pageSize = 5000;
  let fetching = true;

  console.log("Baixando dados do banco para validação profunda...");
  while (fetching) {
    const { data, error } = await supabase
      .from("original_bible_verses")
      .select("book_abbr, chapter, verse, text, key_words")
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error("Erro ao buscar dados:", error);
      return;
    }

    if (data.length === 0) {
      fetching = false;
    } else {
      allVerses.push(...data);
      page++;
    }
  }

  console.log(`Download concluído. Processando ${allVerses.length} versículos...`);

  const foundStructure = {};
  const duplicates = [];
  const invalidStructure = [];

  const verseSet = new Set();

  allVerses.forEach((v) => {
    const key = `${v.book_abbr}_${v.chapter}_${v.verse}`;
    if (verseSet.has(key)) {
      duplicates.push(key);
    }
    verseSet.add(key);

    if (!foundStructure[v.book_abbr]) foundStructure[v.book_abbr] = {};
    if (!foundStructure[v.book_abbr][v.chapter]) foundStructure[v.book_abbr][v.chapter] = 0;
    foundStructure[v.book_abbr][v.chapter]++;

    // Check structure
    if (!v.text || v.text.includes("(") || v.text.includes(")")) {
      invalidStructure.push(`${key} - Falha na regra do parêntese ou texto vazio`);
    }

    // Check keywords if any
    const textMatches = [...v.text.matchAll(/\{\{(.*?)\}\}/g)].map((m) => m[1]);
    const kwTerms = (v.key_words || []).map((k) => k.term);
    for (const term of textMatches) {
      if (!kwTerms.includes(term)) {
        invalidStructure.push(`${key} - Termo {{${term}}} não está no key_words`);
      }
    }
  });

  let missingChapters = [];
  let missingVerses = [];

  for (const book of Object.keys(expectedStructure)) {
    const expBook = expectedStructure[book];
    const foundBook = foundStructure[book] || {};

    for (let c = 1; c <= expBook.chapters; c++) {
      if (!foundBook[c]) {
        missingChapters.push(`${book} ${c}`);
      } else if (foundBook[c] !== expBook.versesPerChapter[c - 1]) {
        missingVerses.push(
          `Capítulo ${book} ${c} esperava ${expBook.versesPerChapter[c - 1]} versos, encontrou ${foundBook[c]}`,
        );
      }
    }
  }

  console.log("\n====== RELATÓRIO FINAL DE AUDITORIA ======");
  console.log(`Duplicidades encontradas: ${duplicates.length}`);
  if (duplicates.length > 0) console.log(duplicates.slice(0, 10));

  console.log(`Capítulos faltando: ${missingChapters.length}`);
  if (missingChapters.length > 0) console.log(missingChapters);

  console.log(`Divergência de contagem de versos nos capítulos: ${missingVerses.length}`);
  if (missingVerses.length > 0) console.log(missingVerses);

  console.log(`Estruturas inválidas / Parênteses vazados: ${invalidStructure.length}`);
  if (invalidStructure.length > 0) console.log(invalidStructure.slice(0, 10));

  console.log("\nAuditoria finalizada.");
  if (
    duplicates.length === 0 &&
    missingChapters.length === 0 &&
    missingVerses.length === 0 &&
    invalidStructure.length === 0 &&
    actualCount === totalExpectedVerses
  ) {
    console.log("✅ STATUS: PROJETO BÍBLIA CONCLUÍDO COM PERFEIÇÃO ABSOLUTA!");
  } else {
    console.log("❌ STATUS: INCONSISTÊNCIAS ENCONTRADAS. É NECESSÁRIO REPARO.");
  }
}

runAudit();
