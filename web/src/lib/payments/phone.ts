/** Normalise un numéro RDC en 243XXXXXXXXX. */
export function normalizeCodPhone(input: string): string {
  let s = (input ?? "").trim();
  if (!s) return s;
  s = s.replace(/[()\s.\-]/g, "");
  if (s.startsWith("+")) s = s.slice(1);
  while (s.startsWith("00")) s = s.slice(2);
  while (s.startsWith("0")) s = s.slice(1);
  if (s.startsWith("243")) {
    s = s.slice(3);
    while (s.startsWith("0")) s = s.slice(1);
  }
  if (/^[89]\d{8}$/.test(s)) return `243${s}`;
  if (/^243[89]\d{8}$/.test(s)) return s;
  if (/^\d{9}$/.test(s)) return `243${s}`;
  return s ? (s.startsWith("243") ? s : `243${s}`) : s;
}

export function isValidCodMsisdn(input: string): boolean {
  return /^243[89]\d{8}$/.test(normalizeCodPhone(input));
}
