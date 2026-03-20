import { NextRequest } from "next/server";
import { proxyRequest } from "../../../_proxy";

export async function GET(req: NextRequest) {
  return proxyRequest(req, "/api/client/auth/me", { method: "GET" });
}
