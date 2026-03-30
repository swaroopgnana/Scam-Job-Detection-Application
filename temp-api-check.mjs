const baseUrl = process.env.BASE_URL || "http://localhost:5000";
const randomId = Date.now();
const credentials = {
  name: "Codex Smoke Test",
  email: `codex-${randomId}@example.com`,
  password: "Pass1234!"
};

const request = async (label, url, options) => {
  try {
    const response = await fetch(url, options);
    const text = await response.text();
    console.log(`CHECK:${label}`);
    console.log(`STATUS:${response.status}`);
    console.log(text);
    return { status: response.status, text };
  } catch (error) {
    console.log(`CHECK:${label}`);
    console.log("STATUS:FETCH_ERROR");
    console.log(error.message);
    return { status: 0, text: error.message };
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForServer = async () => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/`);
      if (response.ok) {
        return true;
      }
    } catch {
      // keep retrying until the server is reachable
    }
    await sleep(1000);
  }

  return false;
};

if (!(await waitForServer())) {
  console.log("CHECK:server-wait");
  console.log("STATUS:FETCH_ERROR");
  console.log(`Could not reach ${baseUrl}`);
  process.exit(1);
}

await request("root", `${baseUrl}/`);
await request("history-no-token", `${baseUrl}/api/history`);
await request("login-invalid", `${baseUrl}/api/auth/login`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    email: "demo@example.com",
    password: "123456"
  })
});

const register = await request("register", `${baseUrl}/api/auth/register`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(credentials)
});

let token = "";
try {
  token = JSON.parse(register.text).token || "";
} catch {
  token = "";
}

if (token) {
  await request("profile", `${baseUrl}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  await request("analyze", `${baseUrl}/api/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      jobText:
        "Urgent hiring. Work from home. No experience needed. Contact on Telegram and pay upfront registration fee for guaranteed income."
    })
  });

  await request("history-with-token", `${baseUrl}/api/history`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
