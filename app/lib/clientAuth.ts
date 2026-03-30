// ─── Client Auth Helpers ─────────────────────────────────────
// Uses a SEPARATE token key from HR to avoid conflicts

const CLIENT_TOKEN_KEY = "client_access_token";
const CLIENT_TOKEN_TYPE_KEY = "client_token_type";

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

export function getClientToken(): string | null {
  if (typeof window === "undefined") return null;
  return getCookie(CLIENT_TOKEN_KEY) || localStorage.getItem(CLIENT_TOKEN_KEY);
}

export function setClientToken(token: string, tokenType: string = "bearer"): void {
  localStorage.setItem(CLIENT_TOKEN_KEY, token);
  localStorage.setItem(CLIENT_TOKEN_TYPE_KEY, tokenType);
  setCookie(CLIENT_TOKEN_KEY, token);
}

export function clearClientToken(): void {
  localStorage.removeItem(CLIENT_TOKEN_KEY);
  localStorage.removeItem(CLIENT_TOKEN_TYPE_KEY);
  deleteCookie(CLIENT_TOKEN_KEY);
}

export function isClientAuthenticated(): boolean {
  const token = getClientToken();
  if (!token) return false;

  try {
    if (token.startsWith("mock_")) {
      const payloadStr = atob(token.replace("mock_", ""));
      const payload = JSON.parse(payloadStr);
      if (payload.exp && Date.now() > payload.exp) {
        clearClientToken();
        return false;
      }
      return true;
    }

    const parts = token.split(".");
    if (parts.length === 3) {
      const payloadStr = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
      const payload = JSON.parse(payloadStr);
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        clearClientToken();
        return false;
      }
    }
  } catch (e) {
    // Ignore decode errors, token might be opaque
  }

  return true;
}
