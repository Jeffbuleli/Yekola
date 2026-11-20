export function hostFromRequest(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-host");
  if (forwarded) return forwarded.split(",")[0].trim().split(":")[0].toLowerCase();
  const host = req.headers.get("host");
  if (host) return host.split(":")[0].toLowerCase();
  return new URL(req.url).hostname.toLowerCase();
}

/** Testnet Pi (hackathon) vs mainnet selon le domaine — un seul build pour les deux instances. */
export function piHostIsTestnet(host?: string): boolean {
  const h = (
    host ||
    (typeof window !== "undefined" ? window.location.hostname : "")
  ).toLowerCase();

  if (h === "yekola.mcbuleli.com") return false;
  if (h === "pi-test.mcbuleli.com" || h === "localhost" || h === "127.0.0.1") return true;
  if (h.includes("minepi.com") || h.includes("pinet.com")) return true;

  return process.env.NEXT_PUBLIC_PI_SANDBOX === "1";
}