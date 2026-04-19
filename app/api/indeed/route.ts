import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY || "";

// Indeed scrapes via Apify which can take 30-90s — use a generous timeout.
// The SSE stream itself is kept alive by the backend; this timeout covers the
// initial HTTP handshake to the backend, not the full stream duration.
const BACKEND_TIMEOUT_MS = 90_000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = new URL(request.url);
    const useStream = url.searchParams.get("stream") === "true";
    const bypassCache = url.searchParams.get("bypass_cache") === "true";
    const looseSearch = url.searchParams.get("loose_search") === "true";

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (API_KEY) {
      headers["X-API-Key"] = API_KEY;
    }

    // Forward the admin JWT so the backend can identify the caller
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const baseEndpoint = useStream
      ? `${BACKEND_URL}/api/jobs/indeed/stream`
      : `${BACKEND_URL}/api/jobs/indeed`;
    const backendParams = new URLSearchParams();
    if (bypassCache) backendParams.set("bypass_cache", "true");
    if (looseSearch)  backendParams.set("loose_search", "true");
    const qs = backendParams.toString();
    const endpoint = qs ? `${baseEndpoint}?${qs}` : baseEndpoint;

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      return NextResponse.json(
        {
          error:
            errorData.detail ||
            errorData.error ||
            `Backend error: ${response.status}`,
        },
        { status: response.status }
      );
    }

    // Pipe SSE stream as-is
    if (useStream && response.body) {
      return new NextResponse(response.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const isTimeout = error instanceof Error && error.name === "TimeoutError";
    console.error("Indeed API error:", error);
    return NextResponse.json(
      {
        error: isTimeout
          ? "Indeed search timed out — Apify scrape took too long"
          : "Failed to search Indeed jobs",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: isTimeout ? 504 : 500 }
    );
  }
}
