async function checkRunJobs() {
  const runId = "32996771353";
  const url = `https://api.github.com/repos/thawfernandes/remix-of-daily-grace-companion/actions/runs/${runId}/jobs`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Antigravity-Agent" } });
    const data = await res.json();
    console.log("Status HTTP:", res.status);
    if (data.jobs) {
      data.jobs.forEach((j) => {
        console.log(`Job: "${j.name}" -> Status: ${j.status}, Conclusão: ${j.conclusion}`);
        if (j.steps) {
          j.steps.forEach((s) => {
            console.log(`  Step: "${s.name}" -> Status: ${s.status}, Conclusão: ${s.conclusion}`);
          });
        }
      });
    } else {
      console.log("Resposta:", data);
    }
  } catch (err) {
    console.error("Erro:", err.message);
  }
}

checkRunJobs();
