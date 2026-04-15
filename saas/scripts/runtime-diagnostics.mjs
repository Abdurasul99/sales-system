const baseUrl = process.env.RUNTIME_BASE_URL ?? "http://localhost:3000";
const login = process.env.RUNTIME_DIAG_LOGIN ?? "admin";
const password = process.env.RUNTIME_DIAG_PASSWORD ?? "Admin123!";

function now() {
  return performance.now();
}

async function timedFetch(label, url, init = {}) {
  const startedAt = now();
  const response = await fetch(url, init);
  const durationMs = Math.round(now() - startedAt);

  return {
    label,
    url,
    status: response.status,
    ok: response.ok,
    durationMs,
    response,
  };
}

async function main() {
  console.log(`Runtime diagnostics against ${baseUrl}`);

  const loginResult = await timedFetch("login", `${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, password }),
  });

  if (!loginResult.ok) {
    throw new Error(`Login failed with status ${loginResult.status}`);
  }

  const cookie = loginResult.response.headers.get("set-cookie");
  if (!cookie) {
    throw new Error("Login succeeded but no session cookie was returned.");
  }

  const authenticatedHeaders = { cookie };
  const checks = [
    ["dashboard", `${baseUrl}/analytics`],
    ["sales", `${baseUrl}/sales`],
    ["products", `${baseUrl}/products`],
    ["purchases", `${baseUrl}/purchases`],
    ["warehouse", `${baseUrl}/warehouse`],
    ["ai-health", `${baseUrl}/api/ai/health`],
  ];

  const results = [loginResult];

  for (const [label, url] of checks) {
    results.push(await timedFetch(label, url, { headers: authenticatedHeaders }));
  }

  const aiProbe = await timedFetch("ai-copilot", `${baseUrl}/api/ai/copilot`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie,
    },
    body: JSON.stringify({
      message: "Why is profit low and what should we do next?",
      pageContext: {
        page: "analytics",
        pageTitle: "Analytics",
        data: { revenue: 1200000, expenses: 900000, profit: 300000, lowStockCount: 4 },
      },
    }),
  });

  results.push(aiProbe);

  for (const result of results) {
    const speed = result.durationMs >= 15000 ? "CRITICAL" : result.durationMs >= 5000 ? "SLOW" : "OK";
    console.log(
      `${result.label.padEnd(12)} status=${String(result.status).padEnd(3)} latency=${String(result.durationMs).padEnd(5)}ms ${speed}`
    );
  }

  const failed = results.find((result) => !result.ok);
  if (failed) {
    throw new Error(`${failed.label} failed with status ${failed.status}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
