async function getJobLogs() {
  const runId = "32996771353";
  const jobsUrl = `https://api.github.com/repos/thawfernandes/remix-of-daily-grace-companion/actions/runs/${runId}/jobs`;
  try {
    const res = await fetch(jobsUrl, { headers: { "User-Agent": "Antigravity-Agent" } });
    const data = await res.json();
    const jobId = data.jobs[0].id;
    console.log("Job ID:", jobId);

    const logUrl = `https://api.github.com/repos/thawfernandes/remix-of-daily-grace-companion/actions/jobs/${jobId}/logs`;
    const logRes = await fetch(logUrl, { headers: { "User-Agent": "Antigravity-Agent" } });
    if (logRes.ok) {
      const text = await logRes.text();
      console.log("=== LOGS COMPLETOS DO GITHUB ACTIONS ===");
      console.log(text.split("\n").slice(-80).join("\n"));
    } else {
      console.log("Status ao buscar logs:", logRes.status, logRes.statusText);
    }
  } catch (err) {
    console.error("Erro:", err.message);
  }
}

getJobLogs();
