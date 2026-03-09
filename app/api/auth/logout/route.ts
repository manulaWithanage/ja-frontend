import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header from the request
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "No authorization token provided" },
        { status: 401 }
      );
    }

    // Forward the logout request to the backend
    const response = await fetch(`${BACKEND_URL}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.detail || "Logout failed",
          detail: data.detail,
        },
        { status: response.status }
      );
    }

    // Return success response
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Logout API error:", error);
    return NextResponse.json(
      { error: "Failed to logout", details: error.message },
      { status: 500 }
    );
  }
}
