import { NextRequest } from "next/server";
import { proxyRequest } from "../../../_proxy";

// GET /api/client/jobs/stats
// Returns: { assignments_used: number, max_assignments: number }
export async function GET(request: NextRequest) {
  const response = await proxyRequest(request, "/api/client/jobs/stats");
  
  if (response.ok) {
    try {
      const data = await response.json();
      // Force limits to 30 on the frontend proxy level
      const modifiedData = {
        ...data,
        max_assignments: 30,
        max_search_attempts: 10
      };
      return new Response(JSON.stringify(modifiedData), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch {
      return response;
    }
  }
  
  return response;
}
