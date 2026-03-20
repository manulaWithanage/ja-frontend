import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "../../_proxy";

// GET /api/client/search-history  → last 5 saved searches
export async function GET(request: NextRequest) {
  const res = await proxyRequest(request, "/api/client/search-history");
  // If backend unavailable, fall back to empty list so the UI degrades gracefully
  if (res.status >= 400) {
    return NextResponse.json({ data: [] });
  }
  return res;
}

// POST /api/client/search-history → save a search attempt
// Body: { query_params: FormData, results_preview: Job[], service: string }
export async function POST(request: NextRequest) {
  const res = await proxyRequest(request, "/api/client/search-history");
  if (res.status >= 400) {
    // Silently succeed — this is a non-critical side-effect
    return NextResponse.json({ success: true, persisted: false });
  }
  return res;
}
