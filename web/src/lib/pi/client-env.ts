/** Connexion Pioneer via Pi SDK (Sandbox / hackathon). */
export function piConnectOnly(): boolean {
  return process.env.NEXT_PUBLIC_PI_SANDBOX === "1";
}