import { NextRequest } from "next/server";
import { proxyRequest } from "../../../_proxy";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.search;
  return proxyRequest(req, `/api/ja-admin/dashboard/activity${search}`);
}
