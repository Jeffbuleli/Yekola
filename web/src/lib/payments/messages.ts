/** Messages paiement lisibles (jamais de JSON brut à l’écran). */

const STATUS_FR: Record<string, string> = {
  pending: "En attente de confirmation sur votre téléphone…",
  processing: "Paiement en cours de traitement…",
  accepted: "Demande acceptée. Confirmez sur Mobile Money…",
  completed: "Paiement confirmé.",
  paid: "Paiement confirmé.",
  demo: "Paiement démo confirmé.",
  failed: "Paiement échoué.",
  rejected: "Paiement refusé.",
  found: "Vérification en cours…",
  not_found: "Paiement introuvable.",
  course_not_found: "Cours introuvable ou pas encore publié. Rafraîchissez la page.",
  already_enrolled: "Vous êtes déjà inscrit à ce cours.",
  own_course: "Vous ne pouvez pas acheter un cours de votre propre académie.",
  admin_no_purchase: "Le compte admin ne peut pas acheter de cours.",
  unauthorized: "Connectez-vous pour acheter ce cours.",
  insufficient_balance: "Solde insuffisant pour ce retrait.",
  invalid_amount: "Montant invalide.",
  payment_failed: "Paiement ou retrait échoué.",
  sudo_required: "Validez SUDO (passkey) pour retirer.",
};

function looksLikeJson(s: string) {
  const t = s.trim();
  return (t.startsWith("{") && t.endsWith("}")) || (t.startsWith("[") && t.endsWith("]"));
}

function extractFromUnknown(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string") {
    const t = value.trim();
    if (!t) return null;
    if (looksLikeJson(t)) {
      try {
        return extractFromUnknown(JSON.parse(t));
      } catch {
        return "Mise à jour du paiement…";
      }
    }
    return t;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (typeof value === "object") {
    const o = value as Record<string, unknown>;
    // PawaPay-ish shapes
    const nested =
      extractFromUnknown(o.failureMessage) ||
      extractFromUnknown(o.message) ||
      extractFromUnknown(o.failureReason) ||
      extractFromUnknown(o.status);
    if (nested) return nested;
    return null;
  }
  return null;
}

export function humanizePaymentStatus(status: string | null | undefined): string {
  if (!status) return "pending";
  return String(status).toLowerCase();
}

export function humanizePaymentMessage(
  raw: unknown,
  status?: string | null,
): string {
  const fromRaw = extractFromUnknown(raw);
  if (fromRaw) {
    // If the "message" is just a machine status code, translate it
    const key = fromRaw.toLowerCase().replace(/\s+/g, "_");
    if (STATUS_FR[key]) return STATUS_FR[key];
    if (STATUS_FR[fromRaw.toUpperCase()]) return STATUS_FR[fromRaw.toUpperCase()];
    // Avoid dumping huge blobs
    if (fromRaw.length > 180 || looksLikeJson(fromRaw)) {
      return statusLabel(status);
    }
    return fromRaw;
  }
  return statusLabel(status);
}

function statusLabel(status?: string | null) {
  const key = humanizePaymentStatus(status);
  return STATUS_FR[key] || "Validez le paiement sur votre téléphone…";
}

export function paymentStatusLabel(status: string | null | undefined): string {
  const key = humanizePaymentStatus(status);
  if (key === "pending" || key === "processing" || key === "accepted") {
    return "en attente";
  }
  if (key === "paid" || key === "completed" || key === "demo") return "payé";
  if (key === "failed" || key === "rejected") return "échoué";
  return key;
}
