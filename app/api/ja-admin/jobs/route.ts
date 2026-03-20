import { NextRequest } from "next/server";
import { proxyRequest } from "../../_proxy";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const query = url.search; // ?clientId=&weekId=&status=
  return proxyRequest(req, `/api/ja-admin/jobs${query}`);
}

export async function POST(req: NextRequest) {
  // Check if this is an archive request or a create request
  const body = await req.clone().json();
  if ("week_id" in body && !("job_title" in body)) {
    // Archive request
    return proxyRequest(req, "/api/ja-admin/jobs/archive", { method: "POST" });
  }
  return proxyRequest(req, "/api/ja-admin/jobs", { method: "POST" });
}

