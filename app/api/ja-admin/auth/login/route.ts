import { NextRequest, NextResponse } from "next/server";

// TODO: backend — replace mock with: POST ${BACKEND_URL}/ja-admin/auth/login
export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  // Mock credentials for now
  if (email === "admin@jateam.com" && password === "password") {
    return NextResponse.json({
      access_token: "mock_ja_admin_token_2026",
      token_type: "bearer",
      user: { name: "JA Admin", email, role: "ja_admin" },
    });
  }

  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}
