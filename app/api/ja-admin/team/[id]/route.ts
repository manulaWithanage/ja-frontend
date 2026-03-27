import { NextRequest } from "next/server";
import { proxyRequest } from "../../../_proxy";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.clone().json();
  if ("status" in body) {
    return proxyRequest(req, `/api/ja-admin/team/${id}/status`, { method: "PATCH" });
  }
  if ("password" in body) {
    return proxyRequest(req, `/api/ja-admin/team/${id}/credentials`, { method: "PATCH" });
  }
  return proxyRequest(req, `/api/ja-admin/team/${id}`, { method: "PATCH" });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyRequest(req, `/api/ja-admin/team/${id}`, { method: "DELETE" });
}
