async function checkRuns() {
  const url = "https://api.github.com/repos/thawfernandes/remix-of-daily-grace-companion/actions/runs";
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Antigravity-Agent" } });
    const data = await res.json();
    console.log("Status HTTP:", res.status);
    if (data.workflow_runs) {
      console.log("Total runs encontrados:", data.total_count);
      data.workflow_runs.slice(0, 5).forEach((r) => {
        console.log(`- Workflow: "${r.name}" (Run #${r.run_number})`);
        console.log(`  Status: ${r.status} | Conclusão: ${r.conclusion || "em andamento"}`);
        console.log(`  Disparado por: ${r.event} em ${r.created_at}`);
        console.log(`  URL: ${r.html_url}`);
      });
    } else {
      console.log("Resposta da API:", data);
    }
  } catch (err) {
    console.error("Erro:", err.message);
  }
}

checkRuns();
