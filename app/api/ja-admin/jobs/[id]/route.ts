import { NextRequest } from "next/server";
import { proxyRequest } from "../../_proxy";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyRequest(req, `/api/ja-admin/jobs/${id}`, { method: "PATCH" });
}
