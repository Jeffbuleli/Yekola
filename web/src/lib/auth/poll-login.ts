const KEY = "yekola_poll_token";

export function savePollToken(token: string | null | undefined) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(KEY, token);
  else localStorage.removeItem(KEY);
}

export function readPollToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY);
}

export function clearPollToken() {
  savePollToken(null);
}

export async function pollLoginOnce(): Promise<{
  ready: boolean;
  user?: { role?: string };
}> {
  const pollToken = readPollToken();
  if (!pollToken) return { ready: false };
  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ action: "poll_login", pollToken }),
  });
  const data = await res.json().catch(() => ({}));
  if (data.ready && data.user) {
    clearPollToken();
    return { ready: true, user: data.user };
  }
  return { ready: false };
}
