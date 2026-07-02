import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// 1. Manually parse .env to avoid extra dependencies
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
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Erro: SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY/SERVICE_ROLE_KEY devem estar definidos no .env.");
  process.exit(1);
}

if (!geminiApiKey) {
  console.error("Erro: A variável GEMINI_API_KEY deve estar definida no seu .env para realizar a tradução via IA.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Canonical Bible Books
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
  { abbr: "ap", name: "Apocalipse", testament: "NT", chapters: 22 }
];

async function fetchAcfBible() {
  const url = 'https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/acf.json';
  const res = await fetch(url);
  return res.json();
}

async function translateChapter(bookAbbr, chapter, versesObj, testament) {
  const bookName = BIBLE_BOOKS.find(b => b.abbr === bookAbbr)?.name || bookAbbr;
  const isAT = testament === "AT";
  const defaultLang = isAT ? "hebraico" : "grego";

  console.log(`Translating ${bookName} ${chapter}...`);

  const versesListText = Object.entries(versesObj)
    .map(([v, txt]) => `v.${v}: ${txt}`)
    .join('\n');

  const prompt = `Você é um tradutor especialista em grego koiné, hebraico antigo e aramaico bíblico.
Traduza o seguinte capítulo da Bíblia (${bookName} ${chapter}) diretamente a partir dos idiomas originais para o português, buscando o sentido literal mais fiel e preciso das palavras originais (mesmo que a construção em português fique menos natural).
Não inclua paráfrases ou adaptações modernas.
Forneça também uma nota exegética objetiva para termos de destaque teológico ou tradutivo do hebraico ou grego.

Retorne APENAS um array JSON estruturado com os seguintes campos para cada versículo:
- "verse" (número do versículo como inteiro)
- "text" (tradução literal o mais próxima do original em português)
- "notes" (nota exegética com detalhes da raiz hebraica/grega se relevante, ou null)
- "original_lang" ("hebraico", "grego" ou "aramaico")

Siga estritamente o formato JSON solicitado abaixo, sem blocos de código markdown adicionais (não use \`\`\`json):
[
  { "verse": 1, "text": "...", "notes": "...", "original_lang": "..." }
]

Texto de referência (ACF):
${versesListText}`;

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

  const response = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Erro na API do Gemini: ${response.status} - ${errText}`);
  }

  const result = await response.json();
  const rawJsonText = result.candidates[0].content.parts[0].text.trim();
  const parsedVerses = JSON.parse(rawJsonText);

  return parsedVerses;
}

async function saveToSupabase(bookAbbr, chapter, verses) {
  const records = verses.map(v => ({
    book_abbr: bookAbbr,
    chapter: chapter,
    verse: v.verse,
    text: v.text,
    notes: v.notes,
    original_lang: v.original_lang
  }));

  const { error } = await supabase
    .from('original_bible_verses')
    .upsert(records, { onConflict: 'book_abbr,chapter,verse' });

  if (error) {
    throw error;
  }
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  const args = process.argv.slice(2);
  const targetBook = args[0];
  const targetChapter = args[1] ? Number(args[1]) : null;

  console.log("Baixando Bíblia base (ACF)...");
  const acfBible = await fetchAcfBible();

  const booksToTranslate = targetBook 
    ? BIBLE_BOOKS.filter(b => b.abbr === targetBook.toLowerCase())
    : BIBLE_BOOKS;

  for (const book of booksToTranslate) {
    const bookData = acfBible.find(b => b.abbrev.toLowerCase() === book.abbr);
    if (!bookData) continue;

    const startCh = targetChapter || 1;
    const endCh = targetChapter || book.chapters;

    for (let c = startCh; c <= endCh; c++) {
      const chapterIndex = c - 1;
      const chapterVersesObj = bookData.chapters[chapterIndex];
      if (!chapterVersesObj) continue;

      let retries = 0;
      const maxRetries = 4;
      let success = false;

      while (retries < maxRetries && !success) {
        try {
          // Translate
          const translated = await translateChapter(book.abbr, c, chapterVersesObj, book.testament);
          // Save
          await saveToSupabase(book.abbr, c, translated);
          console.log(`✓ Salvo com sucesso no Supabase: ${book.name} ${c}`);
          success = true;
          // Cooldown between successful translations to respect standard rate limits
          await sleep(4000); 
        } catch (err) {
          retries++;
          console.error(`❌ Erro ao traduzir ${book.name} ${c} (Tentativa ${retries}/${maxRetries}):`, err.message);
          if (err.message.includes("429") || err.message.includes("RESOURCE_EXHAUSTED")) {
            console.log(`Rate limit atingido. Aguardando 20 segundos antes de tentar novamente...`);
            await sleep(20000);
          } else {
            console.log(`Aguardando 5 segundos antes de tentar novamente...`);
            await sleep(5000);
          }
        }
      }
      
      if (!success) {
        console.error(`Pulando ${book.name} ${c} após ${maxRetries} tentativas sem sucesso.`);
      }
    }
  }

  console.log("Processo de tradução finalizado!");
}

run();
