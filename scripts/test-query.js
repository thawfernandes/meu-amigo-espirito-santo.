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

async function testModel(modelName) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: "Hello" }] }] }),
    });
    const status = res.status;
    const text = await res.text();
    console.log(`Model ${modelName} -> Status: ${status}`);
    if (status !== 200) {
      console.log(`Response: ${text.slice(0, 150)}...`);
    } else {
      console.log(`Success!`);
    }
  } catch (err) {
    console.error(`Error for ${modelName}:`, err.message);
  }
}

async function run() {
  await testModel("gemini-2.5-flash");
  await testModel("gemini-flash-latest");
  await testModel("gemini-2.0-flash-lite");
}

run();
