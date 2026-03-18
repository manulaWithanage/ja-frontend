import { NextRequest } from "next/server";
import { proxyRequest } from "../_proxy";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const query = url.search; // preserves ?status=&search= etc.
  return proxyRequest(req, `/api/ja-admin/clients${query}`);
}

export async function POST(req: NextRequest) {
  return proxyRequest(req, "/api/ja-admin/clients", { method: "POST" });
}
