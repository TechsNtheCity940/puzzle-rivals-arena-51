const AUTH_TOKEN_STORAGE_KEY = "puzzle-rivals-auth-token";

type RequestOptions = RequestInit & {
  token?: string | null;
};

function getDefaultApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL ?? "";
}

export function getWebSocketUrl(token?: string | null) {
  if (import.meta.env.VITE_WS_BASE_URL) {
    const url = new URL("/ws", import.meta.env.VITE_WS_BASE_URL);
    if (token) url.searchParams.set("token", token);
    return url.toString();
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const url = new URL(`${protocol}//${window.location.host}/ws`);
  if (token) url.searchParams.set("token", token);
  return url.toString();
}

export function getStoredAuthToken() {
  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export function setStoredAuthToken(token: string | null) {
  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${getDefaultApiBaseUrl()}${path}`, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.message ?? "API request failed.");
  }

  return payload as T;
}
