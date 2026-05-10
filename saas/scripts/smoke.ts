const DEFAULT_TIMEOUT_MS = 30_000;
const baseUrl = (process.env.SMOKE_BASE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
const login = process.env.SMOKE_LOGIN ?? "admin";
const password = process.env.SMOKE_PASSWORD ?? "Admin123!";

async function request(path: string, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    try {
      return await fetch(`${baseUrl}${path}`, {
        ...init,
        signal: controller.signal,
        headers: {
          "content-type": "application/json",
          ...(init?.headers ?? {}),
        },
      });
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(`Smoke failed: could not reach ${baseUrl}${path}. ${reason}`);
    }
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  const loginPage = await request("/login", { headers: {} });
  if (!loginPage.ok) {
    throw new Error(`Smoke failed: GET /login returned ${loginPage.status}`);
  }

  const loginResponse = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ login, password }),
  });

  if (!loginResponse.ok) {
    const body = await loginResponse.text();
    throw new Error(`Smoke failed: POST /api/auth/login returned ${loginResponse.status}. ${body}`);
  }

  const cookie = loginResponse.headers.get("set-cookie");
  if (!cookie) {
    throw new Error("Smoke failed: login response did not set a session cookie.");
  }

  const analyticsResponse = await request("/analytics", {
    headers: {
      cookie,
    },
  });

  if (!analyticsResponse.ok) {
    throw new Error(`Smoke failed: GET /analytics returned ${analyticsResponse.status}`);
  }

  console.log(`Smoke passed against ${baseUrl}`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
