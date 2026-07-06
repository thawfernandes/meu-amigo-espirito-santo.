import fs from "fs";
import path from "path";

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

const geminiApiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;

async function checkModels() {
  if (!geminiApiKey) {
    console.error("Falta GEMINI_API_KEY no .env");
    return;
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${geminiApiKey}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error("Erro ao listar modelos:", res.status, await res.text());
    return;
  }
  const data = await res.json();
  console.log("Modelos Disponíveis:");
  data.models.forEach((m) => {
    console.log(`- ${m.name} (${m.displayName})`);
  });
}

checkModels();
