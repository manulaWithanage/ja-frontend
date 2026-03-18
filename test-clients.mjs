const api = "http://localhost:8000/api/ja-admin";

async function run() {
  const loginRes = await fetch(`${api}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@jateam.com", password: "JaAdmin@2026" })
  });
  const { access_token } = await loginRes.json();
  
  const headers = { Authorization: `Bearer ${access_token}` };
  
  const teamRes = await fetch(`${api}/team`, { headers });
  console.log("Team data:", await teamRes.text());
  
  const jobsRes = await fetch(`${api}/jobs?client=test`, { headers });
  console.log("Jobs data:", await jobsRes.text());
}

run();
