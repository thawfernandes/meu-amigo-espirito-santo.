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

// 2. Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  env.SUPABASE_PUBLISHABLE_KEY ||
  env.VITE_SUPABASE_ANON_KEY ||
  env.VITE_SUPABASE_PUBLISHABLE_KEY;

const geminiApiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;

if (!supabaseUrl || !supabaseKey || !geminiApiKey) {
  console.error("Erro: Variáveis de ambiente (SUPABASE_URL, CHAVE, GEMINI_API_KEY) ausentes.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const BIBLE_BOOKS = [
  { abbr: "gn", name: "Gênesis", testament: "AT", chapters: 50 },
  { abbr: "ex", name: "Êxodo", testament: "AT", chapters: 40 },
  { abbr: "lv", name: "Levítico", testament: "AT", chapters: 27 },
  { abbr: "nm", name: "Números", testament: "AT", chapters: 36 },
  { abbr: "dt", name: "Deuteronômio", testament: "AT", chapters: 34 },
  { abbr: "js", name: "Josué", testament: "AT", chapters: 24 },
  { abbr: "jz", name: "Juízes", testament: "AT", chapters: 21 },
  { abbr: "rt", name: "Rute", testament: "AT", chapters: 4 },
  { abbr: "1sm", name: "1 Samuel", testament: "AT", chapters: 31 },
  { abbr: "2sm", name: "2 Samuel", testament: "AT", chapters: 24 },
  { abbr: "1rs", name: "1 Reis", testament: "AT", chapters: 22 },
  { abbr: "2rs", name: "2 Reis", testament: "AT", chapters: 25 },
  { abbr: "1cr", name: "1 Crônicas", testament: "AT", chapters: 29 },
  { abbr: "2cr", name: "2 Crônicas", testament: "AT", chapters: 36 },
  { abbr: "ed", name: "Esdras", testament: "AT", chapters: 10 },
  { abbr: "ne", name: "Neemias", testament: "AT", chapters: 13 },
  { abbr: "et", name: "Ester", testament: "AT", chapters: 10 },
  { abbr: "jó", name: "Jó", testament: "AT", chapters: 42 },
  { abbr: "sl", name: "Salmos", testament: "AT", chapters: 150 },
  { abbr: "pv", name: "Provérbios", testament: "AT", chapters: 31 },
  { abbr: "ec", name: "Eclesiastes", testament: "AT", chapters: 12 },
  { abbr: "ct", name: "Cantares", testament: "AT", chapters: 8 },
  { abbr: "is", name: "Isaías", testament: "AT", chapters: 66 },
  { abbr: "jr", name: "Jeremias", testament: "AT", chapters: 52 },
  { abbr: "lm", name: "Lamentações", testament: "AT", chapters: 5 },
  { abbr: "ez", name: "Ezequiel", testament: "AT", chapters: 48 },
  { abbr: "dn", name: "Daniel", testament: "AT", chapters: 12 },
  { abbr: "os", name: "Oséias", testament: "AT", chapters: 14 },
  { abbr: "jl", name: "Joel", testament: "AT", chapters: 3 },
  { abbr: "am", name: "Amós", testament: "AT", chapters: 9 },
  { abbr: "ob", name: "Obadias", testament: "AT", chapters: 1 },
  { abbr: "jn", name: "Jonas", testament: "AT", chapters: 4 },
  { abbr: "mq", name: "Miquéias", testament: "AT", chapters: 7 },
  { abbr: "na", name: "Naum", testament: "AT", chapters: 3 },
  { abbr: "hc", name: "Habacuque", testament: "AT", chapters: 3 },
  { abbr: "sf", name: "Sofonias", testament: "AT", chapters: 3 },
  { abbr: "ag", name: "Ageu", testament: "AT", chapters: 2 },
  { abbr: "zc", name: "Zacarias", testament: "AT", chapters: 14 },
  { abbr: "ml", name: "Malaquias", testament: "AT", chapters: 4 },
  { abbr: "mt", name: "Mateus", testament: "NT", chapters: 28 },
  { abbr: "mc", name: "Marcos", testament: "NT", chapters: 16 },
  { abbr: "lc", name: "Lucas", testament: "NT", chapters: 24 },
  { abbr: "jo", name: "João", testament: "NT", chapters: 21 },
  { abbr: "at", name: "Atos", testament: "NT", chapters: 28 },
  { abbr: "rm", name: "Romanos", testament: "NT", chapters: 16 },
  { abbr: "1co", name: "1 Coríntios", testament: "NT", chapters: 16 },
  { abbr: "2co", name: "2 Coríntios", testament: "NT", chapters: 13 },
  { abbr: "gl", name: "Gálatas", testament: "NT", chapters: 6 },
  { abbr: "ef", name: "Efésios", testament: "NT", chapters: 6 },
  { abbr: "fp", name: "Filipenses", testament: "NT", chapters: 4 },
  { abbr: "cl", name: "Colossenses", testament: "NT", chapters: 4 },
  { abbr: "1ts", name: "1 Tessalonicenses", testament: "NT", chapters: 5 },
  { abbr: "2ts", name: "2 Tessalonicenses", testament: "NT", chapters: 3 },
  { abbr: "1tm", name: "1 Timóteo", testament: "NT", chapters: 6 },
  { abbr: "2tm", name: "2 Timóteo", testament: "NT", chapters: 4 },
  { abbr: "tt", name: "Tito", testament: "NT", chapters: 3 },
  { abbr: "fm", name: "Filemom", testament: "NT", chapters: 1 },
  { abbr: "hb", name: "Hebreus", testament: "NT", chapters: 13 },
  { abbr: "tg", name: "Tiago", testament: "NT", chapters: 5 },
  { abbr: "1pe", name: "1 Pedro", testament: "NT", chapters: 5 },
  { abbr: "2pe", name: "2 Pedro", testament: "NT", chapters: 3 },
  { abbr: "1jo", name: "1 João", testament: "NT", chapters: 5 },
  { abbr: "2jo", name: "2 João", testament: "NT", chapters: 1 },
  { abbr: "3jo", name: "3 João", testament: "NT", chapters: 1 },
  { abbr: "jd", name: "Judas", testament: "NT", chapters: 1 },
  { abbr: "ap", name: "Apocalipse", testament: "NT", chapters: 22 },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const CACHE_DIR = path.resolve(process.cwd(), "scripts", ".cache");
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

// ----- TELEMETRY IN SUPABASE -----
async function updateEngineTelemetry(state) {
  try {
    const payload = {
      id: "translation_engine",
      last_heartbeat: new Date().toISOString(),
      version: "2.0.0",
      notes: JSON.stringify({
        status: state.status, // "active", "waiting", "rate_limited", "completed", "error"
        current_batch: state.currentBatch || null,
        gemini_calls_made: state.geminiCallsMade ?? 0,
        gemini_calls_limit: state.geminiCallLimit ?? 18,
        chapters_translated_this_run: state.chaptersTranslated ?? 0,
        last_run_at: new Date().toISOString(),
        last_run_source: process.env.GITHUB_ACTIONS ? "github-actions" : "local",
        github_run_id: process.env.GITHUB_RUN_ID || null,
        error_message: state.errorMessage || null,
      }),
    };
    await supabase.from("system_health").upsert(payload, { onConflict: "id" });
  } catch (e) {
    // Non-blocking telemetry
    console.warn("[Telemetry] Aviso ao registrar telemetria:", e.message);
  }
}

// ----- DATA FETCHING -----
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

async function fetchOriginalText(bookIndex, chapter, testament) {
  const source = testament === "AT" ? "WLC" : "SBLG";
  const cacheFile = path.join(CACHE_DIR, `original_${source}_${bookIndex}_${chapter}.json`);

  if (fs.existsSync(cacheFile)) {
    return JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
  }

  const url = `https://bolls.life/get-chapter/${source}/${bookIndex}/${chapter}/`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch original text from ${url}: ${res.status}`);
  const data = await res.json();

  fs.writeFileSync(cacheFile, JSON.stringify(data));
  return data;
}

// ----- VALIDATION -----
function validateTranslation(verses, originalCount) {
  if (!Array.isArray(verses)) throw new Error("A resposta não é um array JSON");
  if (verses.length !== originalCount) {
    throw new Error(`Esperava ${originalCount} versículos, mas vieram ${verses.length}`);
  }

  const verseNumbers = verses.map((v) => v.verse);
  for (let v = 1; v <= originalCount; v++) {
    if (!verseNumbers.includes(v)) {
      throw new Error(`Número de versículo ${v} está ausente na resposta da tradução.`);
    }
  }

  for (let i = 0; i < verses.length; i++) {
    const v = verses[i];
    if (!v.text || v.text.trim() === "") throw new Error(`Versículo ${v.verse} está vazio`);

    // Regra anti-parênteses (exceto dentro de {{palavras-chave}})
    const textWithoutKeywords = (v.text || "").replace(/\{\{.*?\}\}/g, "");
    if (textWithoutKeywords.includes("(") || textWithoutKeywords.includes(")")) {
      throw new Error(
        `Texto do versículo ${v.verse} contém parênteses fora de marcações {{}}, o que é proibido nesta tradução.`
      );
    }

    // Auto-correção/Self-healing de palavras-chave ausentes
    const textMatches = [...v.text.matchAll(/\{\{(.*?)\}\}/g)].map((m) => m[1]);
    if (!v.key_words) v.key_words = [];

    for (const term of textMatches) {
      const exists = v.key_words.some((k) => k.term === term);
      if (!exists) {
        // 1. Tenta achar no mesmo versículo um termo parecido
        const similarInVerse = v.key_words.find((k) => {
          if (!k.term) return false;
          const t1 = k.term.toLowerCase().replace(/s$/, "");
          const t2 = term.toLowerCase().replace(/s$/, "");
          return (
            t1 === t2 ||
            term.toLowerCase().includes(k.term.toLowerCase()) ||
            k.term.toLowerCase().includes(term.toLowerCase())
          );
        });

        if (similarInVerse) {
          v.key_words.push({
            term: term,
            word: similarInVerse.word,
            transliteration: similarInVerse.transliteration,
            meaning: similarInVerse.meaning,
          });
          console.log(`[Self-Healing] Corrigido termo no versículo ${v.verse}: Mapeado "${term}" a partir de "${similarInVerse.term}".`);
          continue;
        }

        // 2. Tenta buscar em outros versículos deste mesmo capítulo
        let foundInOtherVerse = null;
        for (let otherVerse of verses) {
          if (otherVerse.key_words) {
            const match = otherVerse.key_words.find((k) => k.term === term);
            if (match) {
              foundInOtherVerse = match;
              break;
            }
          }
        }

        if (foundInOtherVerse) {
          v.key_words.push({
            term: term,
            word: foundInOtherVerse.word,
            transliteration: foundInOtherVerse.transliteration,
            meaning: foundInOtherVerse.meaning,
          });
          console.log(`[Self-Healing] Corrigido termo no versículo ${v.verse}: Mapeado "${term}" a partir do v.${foundInOtherVerse.verse}.`);
          continue;
        }

        // 3. Fallback gracioso
        v.key_words.push({
          term: term,
          word: term,
          transliteration: term,
          meaning: "Termo original",
        });
      }
    }
  }
}

// ---- TOKEN/SIZE ESTIMATION FOR BATCHING ----
// <= 30 verses → "small"  → up to 3 per Gemini call
// 31-60 verses → "medium" → up to 2 per Gemini call
// > 60 verses  → "large"  → always alone
function maxChaptersPerCall(verseCount) {
  if (verseCount <= 30) return 3;
  if (verseCount <= 60) return 2;
  return 1;
}

// ----- GLOSSARY LOADER -----
function loadGlossary() {
  try {
    const glossaryPath = path.resolve(process.cwd(), "scripts", "glossary.json");
    if (fs.existsSync(glossaryPath)) return JSON.parse(fs.readFileSync(glossaryPath, "utf-8"));
  } catch (e) {}
  return null;
}

// ----- TRANSLATION CALL — SINGLE OR MULTI-CHAPTER COM RETRY INTELIGENTE -----
async function translateBatch(chapterRequests, glossary) {
  const isSingle = chapterRequests.length === 1;

  // Pre-fetch all original texts (from cache or bolls.life)
  const chapterData = [];
  for (const req of chapterRequests) {
    const originalData = await fetchOriginalText(req.bookIndex, req.chapter, req.testament);
    const originalListText = originalData.map((v) => `v.${v.verse}: ${v.text}`).join("\n");
    const versesListText = Object.entries(req.versesObj)
      .map(([v, txt]) => `v.${parseInt(v, 10) + 1}: ${txt}`)
      .join("\n");
    const expectedCount = Object.keys(req.versesObj).length;
    const isAT = req.testament === "AT";

    let glossaryText = "   - Nenhuma palavra-chave mapeada.";
    if (glossary) {
      const terms = isAT ? glossary.hebraico : glossary.grego;
      if (terms) {
        const relevantTerms = Object.entries(terms).filter(([k]) => originalListText.includes(k));
        if (relevantTerms.length > 0)
          glossaryText = relevantTerms.map(([k, v]) => `   - "${k}" -> "${v}"`).join("\n");
      }
    }
    chapterData.push({ req, originalListText, versesListText, expectedCount, glossaryText });
  }

  let prompt;
  if (isSingle) {
    const { req, originalListText, versesListText, expectedCount, glossaryText } = chapterData[0];
    prompt = `Você é um tradutor especialista em grego koiné, hebraico antigo e aramaico bíblico.
Traduza o seguinte capítulo da Bíblia (${req.bookName} ${req.chapter}) EXCLUSIVAMENTE a partir do texto original fornecido abaixo para o português.
Para o Antigo Testamento, o texto fornecido é o Texto Massorético (WLC). Para o Novo Testamento, é o SBLGNT.

Diretrizes rigorosas (NÃO VIOLE NENHUMA):
1. FONTE PRIMÁRIA: Traduza diretamente do texto original. O texto da ACF é apenas para numeração.
2. LITERALIDADE EXTREMA: Sentido literal fiel. Preserve repetições e construções brutas.
3. PROIBIDO PARÊNTESES: É expressamente proibido usar "(" e ")". Integre explicações com vírgulas ou travessões.
4. NOMES PRÓPRIOS E TÍTULOS: Preserve nomes e títulos divinos (YHWH, Elohim, Yeshua, etc.).
5. FIGURAS DE LINGUAGEM: Preserve imagens físicas originais.
6. INTERATIVIDADE: Envolva palavras-chave e nomes próprios em chaves duplas {{Palavra}}. Cada termo deve estar em key_words.
7. GLOSSÁRIO:
${glossaryText}
8. ALINHAMENTO ACF (CRÍTICO): Resposta deve ter EXATAMENTE ${expectedCount} versículos (1 a ${expectedCount}). Se o original tiver menos versículos, complete com seu conhecimento do texto. Se tiver mais, agrupe.

Retorne APENAS um array JSON:
[
  { "verse": 1, "text": "...", "original_text": "...", "notes": null, "original_lang": "hebraico", "key_words": [{"term": "...", "word": "...", "transliteration": "...", "meaning": "..."}] }
]

Texto Original:
${originalListText}

Texto ACF (USE APENAS PARA NUMERAÇÃO):
${versesListText}`;
  } else {
    // Multi-chapter prompt
    const chapCountList = chapterData
      .map((cd, i) => `${i + 1}. ${cd.req.bookName} ${cd.req.chapter}: ${cd.expectedCount} versículos esperados`)
      .join("\n");

    const chapBlocks = chapterData
      .map(
        (cd) => `
=== CAPÍTULO: ${cd.req.bookName} ${cd.req.chapter} (${cd.expectedCount} versículos esperados) ===
Glossário:
${cd.glossaryText}
Texto Original:
${cd.originalListText}
Texto ACF (APENAS PARA NUMERAÇÃO):
${cd.versesListText}`
      )
      .join("\n");

    prompt = `Você é um tradutor especialista em grego koiné, hebraico antigo e aramaico bíblico.
Traduza os seguintes ${chapterRequests.length} capítulos da Bíblia para o português, EXCLUSIVAMENTE a partir dos textos originais.
Para o AT, o texto é o Texto Massorético (WLC). Para o NT, é o SBLGNT.

Capítulos a traduzir:
${chapCountList}

Diretrizes (aplicar a TODOS os capítulos):
1. LITERALIDADE EXTREMA. 2. PROIBIDO parênteses. 3. Preserve nomes (YHWH, Elohim, etc.). 4. Use {{chaves duplas}} nas palavras-chave. 5. Cada capítulo deve ter EXATAMENTE o número de versículos indicado.

Retorne APENAS um objeto JSON:
{
  "chapters": [
    {
      "key": "ABREV_CAPITULO",
      "verses": [
        { "verse": 1, "text": "...", "original_text": "...", "notes": null, "original_lang": "hebraico", "key_words": [] }
      ]
    }
  ]
}

Chaves esperadas para os capítulos (na ordem): ${chapterData.map((cd) => `"${cd.req.bookAbbr}_${cd.req.chapter}"`).join(", ")}
${chapBlocks}`;
  }

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

  // Executa com até 2 retries rápidos em caso de pico momentâneo (503)
  let response;
  let attempt = 0;
  const maxAttempts = 3;

  while (attempt < maxAttempts) {
    attempt++;
    try {
      response = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
        }),
      });

      if (response.status === 503 && attempt < maxAttempts) {
        console.warn(`[Gemini 503] Servidor com pico de demanda. Aguardando 5s para retentativa ${attempt}/${maxAttempts - 1}...`);
        await sleep(5000);
        continue;
      }

      break;
    } catch (fetchErr) {
      if (attempt < maxAttempts) {
        console.warn(`[Network Retry] Erro de conexão (${fetchErr.message}). Tentando novamente em 3s...`);
        await sleep(3000);
        continue;
      }
      throw fetchErr;
    }
  }

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Erro API Gemini: ${response.status} - ${errText}`);
  }

  const result = await response.json();
  const rawJsonText = result.candidates[0].content.parts[0].text.trim();

  let parsed;
  try {
    parsed = JSON.parse(rawJsonText);
  } catch (jsonErr) {
    throw new Error(`JSON inválido do Gemini: ${jsonErr.message}. Primeiros 200 chars: ${rawJsonText.substring(0, 200)}`);
  }

  if (isSingle) {
    // Single chapter: validate and return
    validateTranslation(parsed, chapterData[0].expectedCount);
    return [{ req: chapterRequests[0], verses: parsed, validationError: null }];
  } else {
    // Multi-chapter: validate each independently — partial results support
    if (!parsed.chapters || !Array.isArray(parsed.chapters)) {
      throw new Error("Resposta multi-capítulo não contém campo 'chapters'.");
    }
    const results = [];
    for (let i = 0; i < chapterRequests.length; i++) {
      const cd = chapterData[i];
      const expectedKey = `${cd.req.bookAbbr}_${cd.req.chapter}`;
      const chap = parsed.chapters[i] || parsed.chapters.find((c) => c.key === expectedKey);

      if (!chap || !chap.verses) {
        results.push({ req: chapterRequests[i], verses: null, validationError: `Capítulo ausente na resposta do Gemini` });
        continue;
      }

      try {
        validateTranslation(chap.verses, cd.expectedCount);
        results.push({ req: chapterRequests[i], verses: chap.verses, validationError: null });
      } catch (valErr) {
        // Partial failure: this chapter failed validation but others may be preserved!
        results.push({ req: chapterRequests[i], verses: null, validationError: valErr.message });
      }
    }
    return results;
  }
}

// ----- DATABASE HELPERS -----
async function saveToSupabase(bookAbbr, chapter, verses) {
  const records = verses.map((v) => ({
    book_abbr: bookAbbr,
    chapter: chapter,
    verse: v.verse,
    text: v.text,
    original_text: v.original_text || null,
    notes: v.notes || null,
    key_words: v.key_words || null,
    original_lang: v.original_lang || null,
    translation_version: 1,
    model_used: "gemini-2.5-flash",
    review_status: "Gerado pela IA",
  }));
  const { error } = await supabase
    .from("original_bible_verses")
    .upsert(records, { onConflict: "book_abbr,chapter,verse" });
  if (error) throw error;
}

async function markJobCompleted(jobId, verseCount) {
  await supabase.from("translation_jobs").update({
    status: "completed",
    verses_completed: verseCount,
    total_verses: verseCount,
    completed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq("id", jobId);
}

async function markJobRateLimited(jobId, errMessage) {
  await supabase.from("translation_jobs").update({
    status: "rate_limited",
    last_error: errMessage,
    updated_at: new Date().toISOString(),
  }).eq("id", jobId);
}

async function markJobPendingOrFailed(jobId, attempts, errMessage) {
  const nextAttempts = attempts + 1;
  const nextStatus = nextAttempts >= 5 ? "failed" : "pending";
  console.warn(`[Falha] Tentativa ${nextAttempts}/5. Status → '${nextStatus}'.`);
  await supabase.from("translation_jobs").update({
    status: nextStatus,
    attempts: nextAttempts,
    last_error: errMessage,
    updated_at: new Date().toISOString(),
  }).eq("id", jobId);
}

// Erros temporários (rede, 5xx, timeouts) NÃO incrementam tentativas
async function markJobTemporaryError(jobId, errMessage) {
  await supabase.from("translation_jobs").update({
    status: "pending",
    last_error: `[temp] ${errMessage.substring(0, 500)}`,
    updated_at: new Date().toISOString(),
  }).eq("id", jobId);
}

// Classifica o tipo de erro do Gemini
function classifyGeminiError(errMessage) {
  if (errMessage.includes("429") || errMessage.includes("RESOURCE_EXHAUSTED") || errMessage.includes("Quota exceeded"))
    return "rate_limit";
  if (
    errMessage.includes("503") ||
    errMessage.includes("502") ||
    errMessage.includes("500") ||
    errMessage.includes("UNAVAILABLE") ||
    errMessage.includes("Service Unavailable") ||
    errMessage.includes("ECONNRESET") ||
    errMessage.includes("ETIMEDOUT") ||
    errMessage.includes("ENOTFOUND")
  )
    return "temporary";
  if (
    !errMessage.includes("Erro API Gemini") &&
    (errMessage.includes("fetch") ||
      errMessage.includes("network") ||
      errMessage.includes("socket") ||
      errMessage.includes("connect"))
  )
    return "network";
  return "validation";
}

// ----- MAIN BATCH RUNNER -----
async function run() {
  const args = process.argv.slice(2);
  const isForce = args.includes("--force");

  // --limit=N = max N Gemini API calls (each may process 1-3 chapters)
  let geminiCallLimit = 18;
  const limitArg = args.find((a) => a.startsWith("--limit="));
  if (limitArg) geminiCallLimit = parseInt(limitArg.split("=")[1], 10);

  let targetBook = null;
  let targetChapter = null;
  if (args[0] && !args[0].startsWith("--")) {
    targetBook = args[0].toLowerCase();
    if (args[1] && !args[1].startsWith("--")) targetChapter = parseInt(args[1], 10);
  }

  console.log(`\n========================================`);
  console.log(`MOTOR DE TRADUÇÃO AUTÔNOMO DA BÍBLIA`);
  console.log(`Limite de chamadas Gemini nesta rodada: ${geminiCallLimit}`);
  console.log(`Modo Forçar: ${isForce}`);
  console.log(`Ambiente: ${process.env.GITHUB_ACTIONS ? "GitHub Actions (Cloud)" : "Local"}`);
  console.log(`========================================\n`);

  const acfBible = await fetchAcfBible();
  const glossary = loadGlossary();
  let geminiCallsMade = 0;
  let totalChaptersTranslatedThisRun = 0;

  // Registrar início na telemetria
  await updateEngineTelemetry({
    status: "active",
    geminiCallsMade: 0,
    geminiCallLimit,
    chaptersTranslated: 0,
  });

  // --- Reset rate_limited jobs → pending (nova janela de cota) ---
  const { data: rateLimitedJobs, error: rlError } = await supabase
    .from("translation_jobs")
    .select("id, book, chapter")
    .eq("status", "rate_limited");

  if (!rlError && rateLimitedJobs && rateLimitedJobs.length > 0) {
    console.log(`[Reset] ${rateLimitedJobs.length} job(s) rate_limited → pending (nova janela de cota).`);
    const ids = rateLimitedJobs.map((j) => j.id);
    await supabase
      .from("translation_jobs")
      .update({ status: "pending", last_error: null, updated_at: new Date().toISOString() })
      .in("id", ids);
    rateLimitedJobs.forEach((j) => console.log(`  ↩ ${j.book} ${j.chapter} recolocado na fila`));
  }

  while (geminiCallsMade < geminiCallLimit) {
    // --- Step 1: Acquire up to 3 jobs to evaluate batching ---
    const acquiredJobs = [];
    const MAX_TO_FETCH = 3;

    for (let i = 0; i < MAX_TO_FETCH; i++) {
      const { data: jobArray, error: acquireError } = await supabase.rpc("acquire_next_translation_job", {
        p_force: isForce,
        p_target_book: i === 0 ? targetBook : null,
        p_target_chapter: i === 0 ? targetChapter : null,
      });

      if (acquireError) {
        console.error(`Erro ao adquirir job:`, acquireError);
        for (const j of acquiredJobs) {
          await supabase
            .from("translation_jobs")
            .update({ status: "pending", updated_at: new Date().toISOString() })
            .eq("id", j.id);
        }
        await updateEngineTelemetry({
          status: "error",
          geminiCallsMade,
          geminiCallLimit,
          chaptersTranslated: totalChaptersTranslatedThisRun,
          errorMessage: acquireError.message,
        });
        process.exit(1);
      }
      if (!jobArray || jobArray.length === 0) break;
      acquiredJobs.push(jobArray[0]);
    }

    if (acquiredJobs.length === 0) {
      console.log(`\n✓ Nenhum capítulo pendente. Tradução pode estar 100% completa!`);
      await updateEngineTelemetry({
        status: "completed",
        geminiCallsMade,
        geminiCallLimit,
        chaptersTranslated: totalChaptersTranslatedThisRun,
      });
      break;
    }

    // --- Step 2: Enrich with ACF data & handle cache hits ---
    const enrichedJobs = [];
    for (const job of acquiredJobs) {
      const book = BIBLE_BOOKS.find((b) => b.abbr === job.book);
      const bookName = book?.name || job.book;
      const bookData = acfBible.find(
        (b) => b.abbrev?.toLowerCase() === job.book || (job.book === "at" && b.abbrev?.toLowerCase() === "atos")
      );

      if (!bookData) {
        const errorMsg = `ACF: livro não encontrado: ${job.book}`;
        await supabase
          .from("translation_jobs")
          .update({ status: "failed", last_error: errorMsg, updated_at: new Date().toISOString() })
          .eq("id", job.id);
        for (const other of acquiredJobs.filter((j) => j.id !== job.id)) {
          await supabase
            .from("translation_jobs")
            .update({ status: "pending", updated_at: new Date().toISOString() })
            .eq("id", other.id);
        }
        continue;
      }

      const chapterVersesObj = bookData.chapters[job.chapter - 1];
      if (!chapterVersesObj) {
        const errorMsg = `ACF: capítulo ${job.chapter} não encontrado em ${job.book}`;
        await supabase
          .from("translation_jobs")
          .update({ status: "failed", last_error: errorMsg, updated_at: new Date().toISOString() })
          .eq("id", job.id);
        for (const other of acquiredJobs.filter((j) => j.id !== job.id)) {
          await supabase
            .from("translation_jobs")
            .update({ status: "pending", updated_at: new Date().toISOString() })
            .eq("id", other.id);
        }
        continue;
      }

      const expectedVerseCount = Object.keys(chapterVersesObj).length;

      // DB Cache check (100% gratuito — sem consumir chamada Gemini)
      if (!isForce) {
        const { count: existingCount, error: checkError } = await supabase
          .from("original_bible_verses")
          .select("*", { count: "exact", head: true })
          .eq("book_abbr", job.book)
          .eq("chapter", job.chapter);

        if (!checkError && existingCount === expectedVerseCount) {
          console.log(`[Cache-DB] ${bookName} ${job.chapter} já completo (${existingCount} versículos). Marcando sem consumir Gemini.`);
          await markJobCompleted(job.id, expectedVerseCount);
          continue; // Não consome chamada Gemini
        }
      }

      enrichedJobs.push({
        job,
        book,
        bookName,
        bookAbbr: job.book,
        chapter: job.chapter,
        versesObj: chapterVersesObj,
        testament: book.testament,
        bookIndex: BIBLE_BOOKS.findIndex((b) => b.abbr === job.book) + 1,
        expectedVerseCount,
      });
    }

    if (enrichedJobs.length === 0) {
      // Todos eram cache hits — avança na fila sem consumir chamada Gemini
      continue;
    }

    // --- Step 3: Decide batch size based on verse count ---
    const batchSize = Math.min(enrichedJobs.length, maxChaptersPerCall(enrichedJobs[0].expectedVerseCount));

    // Release extra acquired jobs back to pending
    for (let i = batchSize; i < enrichedJobs.length; i++) {
      console.log(`[Devolução] ${enrichedJobs[i].bookName} ${enrichedJobs[i].chapter} devolvido para a fila.`);
      await supabase
        .from("translation_jobs")
        .update({ status: "pending", updated_at: new Date().toISOString() })
        .eq("id", enrichedJobs[i].job.id);
    }

    const batchJobs = enrichedJobs.slice(0, batchSize);
    const chaptersDesc = batchJobs.map((j) => `${j.bookName} ${j.chapter}`).join(" + ");

    // --- Step 4: Call Gemini ---
    console.log(`\n[Gemini] Chamada ${geminiCallsMade + 1}/${geminiCallLimit}: ${chaptersDesc}`);

    await updateEngineTelemetry({
      status: "active",
      currentBatch: chaptersDesc,
      geminiCallsMade,
      geminiCallLimit,
      chaptersTranslated: totalChaptersTranslatedThisRun,
    });

    const chapterRequests = batchJobs.map((j) => ({
      bookAbbr: j.bookAbbr,
      bookName: j.bookName,
      chapter: j.chapter,
      versesObj: j.versesObj,
      testament: j.testament,
      bookIndex: j.bookIndex,
    }));

    let callSucceeded = false;
    try {
      const partialResults = await translateBatch(chapterRequests, glossary);

      // --- Step 5: Persist valid chapters ---
      geminiCallsMade++;
      callSucceeded = true;

      let validSaved = 0;
      let validationFailed = 0;

      for (const result of partialResults) {
        const matched = batchJobs.find((j) => j.bookAbbr === result.req.bookAbbr && j.chapter === result.req.chapter);
        if (!matched) continue;

        if (result.validationError) {
          console.warn(`[Validação Parcial] ${result.req.bookName} ${result.req.chapter}: ${result.validationError}`);
          await markJobPendingOrFailed(matched.job.id, matched.job.attempts, result.validationError);
          validationFailed++;
        } else {
          console.log(`[Supabase] Salvando ${result.verses.length} versículos de ${result.req.bookName} ${result.req.chapter}...`);
          await saveToSupabase(result.req.bookAbbr, result.req.chapter, result.verses);
          await markJobCompleted(matched.job.id, result.verses.length);
          console.log(`✓ ${result.req.bookName} ${result.req.chapter} traduzido e persistido com sucesso!`);
          validSaved++;
          totalChaptersTranslatedThisRun++;
        }
      }

      await updateEngineTelemetry({
        status: "active",
        currentBatch: null,
        geminiCallsMade,
        geminiCallLimit,
        chaptersTranslated: totalChaptersTranslatedThisRun,
      });

      if (validationFailed > 0 && validSaved === 0) {
        console.warn(`[Stop] Todos os capítulos do lote falharam na validação. Encerrando para preservar cota.`);
        break;
      }

      if (geminiCallsMade < geminiCallLimit) await sleep(3000);
    } catch (err) {
      const errMessage = err.message || String(err);
      const errType = classifyGeminiError(errMessage);

      if (errType === "network") {
        console.warn(`[Rede] Sem resposta do servidor (${errMessage.substring(0, 100)}). Fila preservada sem penalidade.`);
        for (const bj of batchJobs) await markJobTemporaryError(bj.job.id, errMessage);
        await updateEngineTelemetry({
          status: "waiting",
          geminiCallsMade,
          geminiCallLimit,
          chaptersTranslated: totalChaptersTranslatedThisRun,
          errorMessage: "Erro de rede temporário",
        });
        break;
      }

      if (!callSucceeded) geminiCallsMade++;

      if (errType === "rate_limit") {
        console.warn(`[Rate Limit] Cota diária do Gemini atingida. Encerrando limpo para retomar na próxima janela.`);
        for (const bj of batchJobs) await markJobRateLimited(bj.job.id, errMessage);
        await updateEngineTelemetry({
          status: "rate_limited",
          geminiCallsMade,
          geminiCallLimit,
          chaptersTranslated: totalChaptersTranslatedThisRun,
          errorMessage: "Cota diária do Gemini atingida",
        });
        process.exit(0);
      } else if (errType === "temporary") {
        console.warn(`[Erro Temporário] Servidor indisponível (${errMessage.substring(0, 80)}). Fila preservada sem penalidade.`);
        for (const bj of batchJobs) await markJobTemporaryError(bj.job.id, errMessage);
        await updateEngineTelemetry({
          status: "waiting",
          geminiCallsMade,
          geminiCallLimit,
          chaptersTranslated: totalChaptersTranslatedThisRun,
          errorMessage: "Serviço Gemini temporariamente indisponível",
        });
        break;
      } else {
        if (batchJobs.length === 1) {
          console.warn(`[Validação] ${batchJobs[0].bookName} ${batchJobs[0].chapter}: ${errMessage.substring(0, 200)}`);
          await markJobPendingOrFailed(batchJobs[0].job.id, batchJobs[0].job.attempts, errMessage);
        } else {
          console.warn(`[Parse] Lote multi-capítulo com erro. Sem penalidade.`);
          for (const bj of batchJobs) await markJobTemporaryError(bj.job.id, `[parse] ${errMessage.substring(0, 300)}`);
        }
        await updateEngineTelemetry({
          status: "waiting",
          geminiCallsMade,
          geminiCallLimit,
          chaptersTranslated: totalChaptersTranslatedThisRun,
          errorMessage: errMessage.substring(0, 100),
        });
        break;
      }
    }
  }

  // Telemetria final
  await updateEngineTelemetry({
    status: "waiting",
    currentBatch: null,
    geminiCallsMade,
    geminiCallLimit,
    chaptersTranslated: totalChaptersTranslatedThisRun,
  });

  console.log(`\n========================================`);
  console.log(`EXECUÇÃO CONCLUÍDA`);
  console.log(`Chamadas Gemini realizadas: ${geminiCallsMade}/${geminiCallLimit}`);
  console.log(`Capítulos concluídos nesta rodada: ${totalChaptersTranslatedThisRun}`);
  console.log(`Chamadas não utilizadas: ${geminiCallLimit - geminiCallsMade}`);
  console.log(`========================================\n`);

  process.exit(0);
}

run();
