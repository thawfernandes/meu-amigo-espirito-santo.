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

// 2. Initialize Supabase Client (No service role key hardcoded)
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

  for (let i = 0; i < verses.length; i++) {
    const v = verses[i];
    if (!v.text || v.text.trim() === "") throw new Error(`Versículo ${v.verse} está vazio`);

    // Regra rígida anti-parênteses
    if (v.text.includes("(") || v.text.includes(")")) {
      throw new Error(
        `Texto do versículo ${v.verse} contém parênteses, o que é estritamente proibido nesta tradução.`
      );
    }

    // Mapeamento de termos
    const textMatches = [...v.text.matchAll(/\{\{(.*?)\}\}/g)].map((m) => m[1]);
    const kwTerms = (v.key_words || []).map((k) => k.term);

    for (const term of textMatches) {
      if (!kwTerms.includes(term)) {
        throw new Error(
          `O termo "{{${term}}}" aparece no versículo ${v.verse} mas não está mapeado em key_words`
        );
      }
    }
  }
}

// ----- TRANSLATION CALL -----
async function translateChapter(bookAbbr, chapter, versesObj, testament, bookIndex) {
  const book = BIBLE_BOOKS.find((b) => b.abbr === bookAbbr);
  const bookName = book?.name || bookAbbr;
  const isAT = testament === "AT";

  let glossaryText = "   - Nenhuma palavra-chave mapeada para este capítulo.";
  const originalData = await fetchOriginalText(bookIndex, chapter, testament);
  const originalListText = originalData.map((v) => `v.${v.verse}: ${v.text}`).join("\n");
  const versesListText = Object.entries(versesObj)
    .map(([v, txt]) => `v.${v}: ${txt}`)
    .join("\n");
  const expectedCount = Object.keys(versesObj).length;

  try {
    const glossaryPath = path.resolve(process.cwd(), "scripts", "glossary.json");
    if (fs.existsSync(glossaryPath)) {
      const glossary = JSON.parse(fs.readFileSync(glossaryPath, "utf-8"));
      const terms = isAT ? glossary.hebraico : glossary.grego;

      if (terms) {
        const relevantTerms = Object.entries(terms).filter(([k]) =>
          originalListText.includes(k)
        );
        if (relevantTerms.length > 0) {
          glossaryText = relevantTerms.map(([k, v]) => `   - "${k}" -> "${v}"`).join("\n");
        }
      }
    }
  } catch (e) {}

  const prompt = `Você é um tradutor especialista em grego koiné, hebraico antigo e aramaico bíblico.
Traduza o seguinte capítulo da Bíblia (${bookName} ${chapter}) EXCLUSIVAMENTE a partir do texto original fornecido abaixo para o português.
Para o Antigo Testamento, o texto fornecido é o Texto Massorético (WLC). Para o Novo Testamento, é o SBLGNT (Society of Biblical Literature Greek New Testament).

Diretrizes rigorosas (NÃO VIOLE NENHUMA):
1. FONTE PRIMÁRIA: Traduza diretamente do texto original fornecido. O texto da ACF é apenas para numeração.
2. LITERALIDADE EXTREMA: Busque o sentido literal mais fiel e preciso. Preserve repetições, expressões rudes e construções brutas. Não tente deixar o português elegante.
3. PROIBIDO PARÊNTESES (MAS PRESERVE A INFORMAÇÃO): É expressamente proibido usar os caracteres "(" e ")". Se o texto original contiver um aposto geográfico, identificação ou explicação que faça parte do texto original (ex: "esta é Zoar"), NÃO OMITA a informação. Apenas reescreva a frase integrando a informação com vírgulas ou travessões, NUNCA usando parênteses.
4. NOMES PRÓPRIOS E TÍTULOS: Preserve nomes próprios e títulos divinos (Yeshua, Miryam, Beth-Lechem, Yerushalayim, YHWH, Elohim, Shaddai, etc.).
5. FIGURAS DE LINGUAGEM CONCRETAS: Preserve imagens físicas originais (ex: "encher a mão", "levantar a face").
6. INTERATIVIDADE: Para permitir o estudo, você deve OBRIGATORIAMENTE envolver palavras-chave importantes e nomes próprios na tradução em chaves duplas. Exemplo: "E {{Elimeleque}} foi para {{Beth-Lechem}}". Cada termo mapeado deve estar no JSON.
7. CONSISTÊNCIA DE TERMOS: Mantenha a tradução consistente baseada no glossário abaixo:
${glossaryText}
8. NUMERAÇÃO: Mapeie de volta para a numeração exigida.

Retorne APENAS um array JSON estruturado com os campos:
- "verse" (inteiro)
- "text" (texto com os marcadores {{Palavra}})
- "original_text" (a string original)
- "notes" (nota exegética se necessário, ou null)
- "original_lang" ("hebraico", "grego" ou "aramaico")
- "key_words" (array: [{"term": "Exata palavra entre as chaves", "word": "original", "transliteration": "translit", "meaning": "significado"}])

Formato:
[
  { "verse": 1, "text": "...", "original_text": "...", "notes": "...", "original_lang": "...", "key_words": [] }
]

Texto Original:
${originalListText}

Texto ACF (USE APENAS PARA NUMERAÇÃO):
${versesListText}`;

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

  const response = await fetch(geminiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Erro API Gemini: ${response.status} - ${errText}`);
  }

  const result = await response.json();
  const rawJsonText = result.candidates[0].content.parts[0].text.trim();
  const parsedVerses = JSON.parse(rawJsonText);

  validateTranslation(parsedVerses, expectedCount);

  return parsedVerses;
}

// ----- DATABASE OPERATIONS -----
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

  if (error) {
    throw error;
  }
}

// ----- MAIN BATCH BIBLE RUNNER -----
async function run() {
  const args = process.argv.slice(2);
  const isForce = args.includes("--force");
  
  let limit = 1;
  const limitArg = args.find(a => a.startsWith("--limit="));
  if (limitArg) {
    limit = parseInt(limitArg.split("=")[1], 10);
  }

  // Parse direct targets if given (e.g. "gn 1" or "gn")
  let targetBook = null;
  let targetChapter = null;
  if (args[0] && !args[0].startsWith("--")) {
    targetBook = args[0].toLowerCase();
    if (args[1] && !args[1].startsWith("--")) {
      targetChapter = parseInt(args[1], 10);
    }
  }

  console.log(`Iniciando tradutor em lote. Limite: ${limit} capítulos. Forçar: ${isForce}`);

  const acfBible = await fetchAcfBible();
  let chaptersProcessed = 0;

  while (chaptersProcessed < limit) {
    console.log(`\n[Lote] Solicitando aquisição atômica do próximo capítulo...`);
    
    // Acquire next job atomically
    const { data: jobArray, error: acquireError } = await supabase
      .rpc("acquire_next_translation_job", {
        p_force: isForce,
        p_target_book: targetBook,
        p_target_chapter: targetChapter
      });

    if (acquireError) {
      console.error(`Erro ao adquirir o próximo job:`, acquireError);
      process.exit(1);
    }

    if (!jobArray || jobArray.length === 0) {
      console.log(`Nenhum capítulo pendente ou qualificado para processamento.`);
      break;
    }

    const job = jobArray[0];
    const book = BIBLE_BOOKS.find(b => b.abbr === job.book);
    const bookName = book?.name || job.book;

    console.log(`Adquirido: ${bookName} Capítulo ${job.chapter} (ID: ${job.id}, Tentativa: ${job.attempts + 1})`);

    const bookData = acfBible.find((b) => b.abbrev.toLowerCase() === job.book || (job.book === "at" && b.abbrev.toLowerCase() === "atos"));
    if (!bookData) {
      const errorMsg = `Dados do livro ACF não encontrados para abbrev: ${job.book}`;
      console.error(errorMsg);
      await supabase
        .from("translation_jobs")
        .update({ status: "failed", last_error: errorMsg, updated_at: new Date().toISOString() })
        .eq("id", job.id);
      process.exit(1);
    }

    const chapterIndex = job.chapter - 1;
    const chapterVersesObj = bookData.chapters[chapterIndex];
    if (!chapterVersesObj) {
      const errorMsg = `Capítulo ${job.chapter} não encontrado no livro ACF ${job.book}`;
      console.error(errorMsg);
      await supabase
        .from("translation_jobs")
        .update({ status: "failed", last_error: errorMsg, updated_at: new Date().toISOString() })
        .eq("id", job.id);
      process.exit(1);
    }

    const expectedVerseCount = Object.keys(chapterVersesObj).length;

    // Check if we already have this chapter completed locally/db without --force
    if (!isForce) {
      const { count: existingCount, error: checkError } = await supabase
        .from("original_bible_verses")
        .select("*", { count: "exact", head: true })
        .eq("book_abbr", job.book)
        .eq("chapter", job.chapter);

      if (!checkError && existingCount === expectedVerseCount) {
        console.log(`[Cache-DB] Capítulo ${bookName} ${job.chapter} já está completo no banco de dados (${existingCount}/${expectedVerseCount} versículos).`);
        await supabase
          .from("translation_jobs")
          .update({
            status: "completed",
            verses_completed: expectedVerseCount,
            total_verses: expectedVerseCount,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq("id", job.id);
        chaptersProcessed++;
        continue;
      }
    }

    // Call Gemini
    try {
      const bookIndex = BIBLE_BOOKS.findIndex((b) => b.abbr === job.book) + 1;
      
      console.log(`[Gemini] Enviando ${bookName} ${job.chapter} para tradução...`);
      const translatedVerses = await translateChapter(
        job.book,
        job.chapter,
        chapterVersesObj,
        book.testament,
        bookIndex
      );

      console.log(`[Supabase] Salvando ${translatedVerses.length} versículos de ${bookName} ${job.chapter}...`);
      await saveToSupabase(job.book, job.chapter, translatedVerses);

      // Only mark as completed AFTER successful save/validation
      await supabase
        .from("translation_jobs")
        .update({
          status: "completed",
          verses_completed: translatedVerses.length,
          total_verses: expectedVerseCount,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", job.id);

      console.log(`✓ Capítulo ${bookName} ${job.chapter} traduzido e persistido com sucesso!`);
      chaptersProcessed++;

      // Small delay between calls in the same batch
      if (chaptersProcessed < limit) {
        await sleep(5000);
      }

    } catch (err) {
      const errMessage = err.message || String(err);
      console.error(`Erro ao traduzir ${bookName} ${job.chapter}:`, errMessage);

      const isRateLimit =
        errMessage.includes("429") || 
        errMessage.includes("RESOURCE_EXHAUSTED") || 
        errMessage.includes("Quota exceeded");

      if (isRateLimit) {
        // Mark job as rate_limited, stop batch immediately
        console.warn(`[Rate Limit] Gemini atingido (429). Encerrando o lote atual.`);
        await supabase
          .from("translation_jobs")
          .update({
            status: "rate_limited",
            last_error: errMessage,
            updated_at: new Date().toISOString()
          })
          .eq("id", job.id);
        
        process.exit(0); // Exit cleanly, let the next cron run resume
      } else {
        // Validation/JSON or other errors: increment attempts
        const nextAttempts = job.attempts + 1;
        const nextStatus = nextAttempts >= 5 ? "failed" : "pending";
        
        console.warn(`[Falha] Tentativa ${nextAttempts}/5. Definindo status como '${nextStatus}'.`);
        
        await supabase
          .from("translation_jobs")
          .update({
            status: nextStatus,
            attempts: nextAttempts,
            last_error: errMessage,
            updated_at: new Date().toISOString()
          })
          .eq("id", job.id);

        process.exit(1); // Exit with error for other types of failures to alert monitoring
      }
    }
  }

  console.log(`\nLote finalizado. Processados ${chaptersProcessed} capítulos.`);
  process.exit(0);
}

run();
