/**
 * test-jsearch.mjs
 *
 * Tests the JSearch endpoint in three modes:
 *   1. Direct backend (non-streaming): POST http://localhost:8000/api/jobs/jsearch
 *   2. Direct backend (streaming SSE): POST http://localhost:8000/api/jobs/jsearch/stream
 *   3. Via Next.js proxy:              POST http://localhost:3000/api/jsearch
 *
 * Run: node test-jsearch.mjs
 *
 * Tweak PAYLOAD below to match the failing query.
 * Tweak BACKEND_URL / NEXTJS_URL if your ports differ.
 */

// ============================================================
// CONFIG
// ============================================================
const BACKEND_URL = "http://localhost:8000";
const NEXTJS_URL  = "http://localhost:3000";
const API_KEY     = ""; // set if your backend requires X-API-Key
const TIMEOUT_MS  = 60_000;

// ============================================================
// PAYLOAD  -- edit this to match the failing UI query
// ============================================================
const PAYLOAD = {
  jobTitle:   "Customer success manager",
  industry:   "Technology",
  salaryMin:  "80000",
  salaryMax:  "100000",
  jobType:    "",               // Any | Remote | On-site | Hybrid | Full-time | Part-time
  city:       "San Francisco Bay Area",
  country:    "US",
  datePosted: "today",          // today | week | month | ""
};

// ============================================================
// HELPERS
// ============================================================
function makeHeaders() {
  const h = { "Content-Type": "application/json" };
  if (API_KEY) h["X-API-Key"] = API_KEY;
  return h;
}

async function postJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: makeHeaders(),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function postStream(url, body, onEvent) {
  const res = await fetch(url, {
    method: "POST",
    headers: makeHeaders(),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} - ${errText}`);
  }

  const reader  = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer    = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      if (line.trim() && line.startsWith("data: ")) {
        try {
          onEvent(JSON.parse(line.slice(6)));
        } catch {
          process.stdout.write("  [warn] Could not parse SSE line: " + line + "\n");
        }
      }
    }
  }
}

function sep(title) {
  process.stdout.write("\n" + "=".repeat(60) + "\n");
  process.stdout.write("  " + title + "\n");
  process.stdout.write("=".repeat(60) + "\n");
}

function printJob(job, i) {
  process.stdout.write(
    `\n  [${i + 1}] ${job.title || "(no title)"}\n` +
    `      Company  : ${job.company  || "-"}\n` +
    `      Location : ${job.location || "-"}\n` +
    `      Salary   : ${job.salary   || "-"}\n` +
    `      Type     : ${job.type     || "-"}  |  Remote: ${job.remote}\n` +
    `      Posted   : ${job.posted   || "-"}\n` +
    `      Apply    : ${job.applyLink || "-"}\n`
  );
}

function printJobs(jobs) {
  if (!jobs || jobs.length === 0) {
    process.stdout.write("  [warn] No jobs returned.\n");
    return;
  }
  process.stdout.write("  Jobs returned: " + jobs.length + "\n");
  jobs.slice(0, 5).forEach((j, i) => printJob(j, i));
  if (jobs.length > 5) {
    process.stdout.write("\n  ... and " + (jobs.length - 5) + " more.\n");
  }
}

// ============================================================
// TEST 1 — direct backend, non-streaming
// ============================================================
async function testDirect() {
  sep("TEST 1 -- Direct backend (POST /api/jobs/jsearch)");
  process.stdout.write("  Payload: " + JSON.stringify(PAYLOAD, null, 4) + "\n");

  try {
    const { status, ok, data } = await postJson(
      `${BACKEND_URL}/api/jobs/jsearch`,
      PAYLOAD
    );

    process.stdout.write("\n  HTTP " + status + "\n");

    if (!ok) {
      process.stdout.write("  [FAIL] Backend error:\n");
      process.stdout.write("  " + JSON.stringify(data, null, 4) + "\n");
      return;
    }

    printJobs(data?.jobs);

    // Print metadata apart from jobs array
    const meta = { ...data };
    delete meta.jobs;
    if (Object.keys(meta).length) {
      process.stdout.write("\n  Response metadata: " + JSON.stringify(meta, null, 4) + "\n");
    }
  } catch (err) {
    process.stdout.write("  [FAIL] " + err.message + "\n");
  }
}

// ============================================================
// TEST 2 — direct backend, streaming (SSE)
// ============================================================
async function testStream() {
  sep("TEST 2 -- Direct backend streaming (POST /api/jobs/jsearch/stream)");
  process.stdout.write("  Payload: " + JSON.stringify(PAYLOAD, null, 4) + "\n");

  let eventCount = 0;
  let finalJobs  = null;

  try {
    await postStream(
      `${BACKEND_URL}/api/jobs/jsearch/stream`,
      PAYLOAD,
      (data) => {
        eventCount++;
        if (data.type === "start") {
          process.stdout.write("  -> [start] " + (data.message || "") + "\n");
        } else if (data.type === "progress") {
          process.stdout.write(
            `  -> [progress] count=${data.count}  status=${data.status || ""}\n`
          );
        } else if (data.type === "complete") {
          finalJobs = data.jobs || [];
          process.stdout.write("  -> [complete] jobs=" + finalJobs.length + "\n");
          printJobs(finalJobs);
          if (finalJobs.length === 0) {
            process.stdout.write(
              "  Full 'complete' event: " + JSON.stringify(data, null, 4) + "\n"
            );
          }
        } else if (data.type === "error") {
          process.stdout.write(
            "  [FAIL] Stream error event: " + JSON.stringify(data, null, 4) + "\n"
          );
        } else {
          process.stdout.write(
            "  -> [unknown] " + JSON.stringify(data) + "\n"
          );
        }
      }
    );

    process.stdout.write("\n  Stream finished. Total events: " + eventCount + "\n");
    if (finalJobs === null) {
      process.stdout.write(
        "  [warn] Stream ended without a 'complete' event.\n"
      );
    }
  } catch (err) {
    process.stdout.write("  [FAIL] " + err.message + "\n");
  }
}

// ============================================================
// TEST 3 — via Next.js proxy
// ============================================================
async function testProxy() {
  sep("TEST 3 -- Via Next.js proxy (POST /api/jsearch)");
  process.stdout.write(
    "  (requires Next.js dev server running on port 3000)\n"
  );
  process.stdout.write("  Payload: " + JSON.stringify(PAYLOAD, null, 4) + "\n");

  try {
    const { status, ok, data } = await postJson(
      `${NEXTJS_URL}/api/jsearch`,
      PAYLOAD
    );

    process.stdout.write("\n  HTTP " + status + "\n");

    if (!ok) {
      process.stdout.write("  [FAIL] Proxy error:\n");
      process.stdout.write("  " + JSON.stringify(data, null, 4) + "\n");
      return;
    }

    printJobs(data?.jobs);
  } catch (err) {
    if (err.message.includes("ECONNREFUSED") || err.message.includes("fetch failed")) {
      process.stdout.write(
        "  [skip] Next.js dev server not running on port 3000.\n"
      );
    } else {
      process.stdout.write("  [FAIL] " + err.message + "\n");
    }
  }
}

// ============================================================
// MAIN
// ============================================================
(async () => {
  process.stdout.write("\nJSearch Endpoint Test\n");
  process.stdout.write("  Backend : " + BACKEND_URL + "\n");
  process.stdout.write("  Next.js : " + NEXTJS_URL + "\n");
  process.stdout.write("  Payload : " + JSON.stringify(PAYLOAD) + "\n");

  await testDirect();
  await testStream();
  await testProxy();

  process.stdout.write("\n" + "=".repeat(60) + "\n");
  process.stdout.write("  Done.\n");
  process.stdout.write("=".repeat(60) + "\n\n");
})();
