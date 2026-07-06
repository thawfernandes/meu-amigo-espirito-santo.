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

const supabaseUrl = process.env.SUPABASE_URL || env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function review() {
  const { data, error } = await supabase
    .from('original_bible_verses')
    .select('*')
    .eq('book_abbr', 'rt')
    .order('chapter', { ascending: true })
    .order('verse', { ascending: true });
    
  if (error) {
    console.error("Erro:", error);
    return;
  }
  
  if (data.length === 0) {
    console.log("Nenhum versículo encontrado para Rute ainda.");
    return;
  }
  
  console.log(`Encontrados ${data.length} versículos de Rute no banco.`);
  console.log("\n--- AMOSTRAGEM DE QUALIDADE ---");
  
  // Pegamos os 3 primeiros versículos
  for (let i = 0; i < Math.min(3, data.length); i++) {
    const v = data[i];
    console.log(`\n[Rute ${v.chapter}:${v.verse}]`);
    console.log(`Tradução: ${v.text}`);
    console.log(`Original: ${v.original_text} (${v.original_lang})`);
    console.log(`Notas exegéticas: ${v.notes}`);
    console.log(`Palavras-chave:`);
    if (v.key_words) {
      v.key_words.forEach(kw => {
        console.log(` - ${kw.word} (${kw.transliteration}): ${kw.meaning}`);
      });
    }
  }
  
  // Salvamos completo para análise profunda
  fs.writeFileSync('scripts/rute-review.json', JSON.stringify(data, null, 2));
  console.log("\nDados completos exportados para scripts/rute-review.json");
}

review();
