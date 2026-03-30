// ─── Admin Auth Helpers ──────────────────────────────────────
// Reuses the existing HR access_token for admin operations

const ADMIN_TOKEN_KEY = "access_token";

function getCookie(name: string): string | null {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return decodeURIComponent(match[2]);
  return null;
}

function setCookie(name: string, value: string, days = 7) {
  if (typeof window === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
}

function deleteCookie(name: string) {
  if (typeof window === "undefined") return;
  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return getCookie(ADMIN_TOKEN_KEY) || localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem("token_type", "bearer");
  setCookie(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem("token_type");
  deleteCookie(ADMIN_TOKEN_KEY);
}

export function isAdminAuthenticated(): boolean {
  const token = getAdminToken();
  if (!token) return false;

  try {
    const parts = token.split(".");
    if (parts.length === 3) {
      const payloadStr = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
      const payload = JSON.parse(payloadStr);
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        clearAdminToken();
        return false;
      }
    }
  } catch (e) {
    // Ignore decode errors, token might be opaque
  }

  return true;
}
