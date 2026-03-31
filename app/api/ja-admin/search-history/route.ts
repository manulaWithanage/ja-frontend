import { NextRequest } from "next/server";
import { proxyRequest } from "../../_proxy";

// GET /api/ja-admin/search-history
export async function GET(req: NextRequest) {
  return proxyRequest(req, "/api/ja-admin/search-history");
}

// POST /api/ja-admin/search-history
export async function POST(req: NextRequest) {
  return proxyRequest(req, "/api/ja-admin/search-history", { method: "POST" });
}
