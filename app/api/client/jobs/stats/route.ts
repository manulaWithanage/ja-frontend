import { NextRequest } from "next/server";
import { proxyRequest } from "../../../_proxy";

// GET /api/client/jobs/stats
// Returns: { assignments_used: number, max_assignments: number }
export async function GET(request: NextRequest) {
  return proxyRequest(request, "/api/client/jobs/stats");
}
