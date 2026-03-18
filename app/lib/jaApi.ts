// ─── JA Admin API Service Layer ──────────────────────────────
// Centralized fetch wrapper for all JA Admin API calls.
// All requests go through Next.js API routes which proxy to BACKEND_URL.

import { getJaToken } from "./jaAuth";

const BASE = "/api/ja-admin";

class JaApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "JaApiError";
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getJaToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new JaApiError(body.error || body.detail || "Request failed", res.status);
  }

  return res.json();
}

// ─── Convenience methods ─────────────────────────────────────

export const jaApi = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),

  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),

  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),

  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export { JaApiError };
