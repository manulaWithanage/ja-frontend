import { NextRequest } from "next/server";
import { proxyRequest } from "../../../_proxy";

export async function POST(req: NextRequest) {
  // Use the standard proxyRequest to forward the login request to the backend
  return proxyRequest(req, "/api/client/auth/login", { 
    method: "POST" 
  });
}
