// ─── JA Internal Admin Auth Helpers ─────────────────────────
// Separate token key to avoid collisions with client or HR tokens

const JA_TOKEN_KEY = "ja_access_token";
const JA_TOKEN_TYPE_KEY = "ja_token_type";

export function getJaToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(JA_TOKEN_KEY);
}

export function setJaToken(token: string, tokenType: string = "bearer"): void {
  localStorage.setItem(JA_TOKEN_KEY, token);
  localStorage.setItem(JA_TOKEN_TYPE_KEY, tokenType);
}

export function clearJaToken(): void {
  localStorage.removeItem(JA_TOKEN_KEY);
  localStorage.removeItem(JA_TOKEN_TYPE_KEY);
}

export function isJaAuthenticated(): boolean {
  return !!getJaToken();
}
