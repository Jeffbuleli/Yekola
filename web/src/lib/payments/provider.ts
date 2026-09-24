import { randomUUID } from "crypto";
import {
  isPawapayConfigured,
  pawapayDeposit,
  pawapayPayout,
} from "./pawapay-client";
import { detectMomoProvider } from "./momo-providers";
import { isValidCodMsisdn, normalizeCodPhone } from "./phone";

export type PaymentResult = {
  status: "demo" | "pending" | "paid" | "failed";
  reference: string;
  message: string;
  provider: string;
  msisdn?: string;
  momoProvider?: string;
};

export type PaymentInput = {
  amount: number;
  currency: "CDF" | "USD";
  msisdn?: string;
  momoProvider?: string;
  description: string;
  kind: "course_purchase" | "teacher_subscription" | "withdrawal";
};

export interface PaymentProvider {
  id: string;
  label: string;
  initiate(input: PaymentInput): Promise<PaymentResult>;
}

function refFor(_kind: PaymentInput["kind"]) {
  // PawaPay v2: depositId / payoutId must be UUID length 36 (with hyphens).
  return randomUUID();
}

/** DEMO — aucun débit réel ; fulfillment immédiat côté API. */
export const DemoPaymentProvider: PaymentProvider = {
  id: "demo",
  label: "Démo",
  async initiate(input) {
    return {
      status: "demo",
      reference: refFor(input.kind),
      message: `Paiement simulé : ${input.amount} ${input.currency}. Aucun débit réel.`,
      provider: "demo",
      msisdn: input.msisdn ? normalizeCodPhone(input.msisdn) : undefined,
      momoProvider: input.momoProvider || (input.msisdn ? detectMomoProvider(input.msisdn) ?? undefined : undefined),
    };
  },
};

export const MomoPaymentProvider: PaymentProvider = {
  id: "momo",
  label: "Mobile Money",
  async initiate(input) {
    if (!isPawapayConfigured()) {
      return {
        status: "failed",
        reference: refFor(input.kind),
        message:
          "Mobile Money non configuré (PAWAPAY_API_TOKEN manquant). Utilisez YEKOOLA_PAYMENTS=demo pour les tests.",
        provider: "momo",
      };
    }

    if (!input.msisdn || !isValidCodMsisdn(input.msisdn)) {
      return {
        status: "failed",
        reference: refFor(input.kind),
        message: "Numéro Mobile Money invalide (ex. 0812… ou 243812…).",
        provider: "momo",
      };
    }

    const msisdn = normalizeCodPhone(input.msisdn);
    const momoProvider =
      input.momoProvider || detectMomoProvider(msisdn) || undefined;
    if (!momoProvider) {
      return {
        status: "failed",
        reference: refFor(input.kind),
        message: "Opérateur non reconnu. Choisissez Airtel, Orange ou M-Pesa.",
        provider: "momo",
      };
    }

    if (input.amount <= 0 && input.kind !== "teacher_subscription") {
      return {
        status: "paid",
        reference: refFor(input.kind),
        message: "Montant nul - aucune collecte MoMo.",
        provider: "momo",
        msisdn,
        momoProvider,
      };
    }

    // Free subscription
    if (input.kind === "teacher_subscription" && input.amount <= 0) {
      return {
        status: "paid",
        reference: refFor(input.kind),
        message: "Plan Free activé.",
        provider: "momo",
        msisdn,
        momoProvider,
      };
    }

    const reference = refFor(input.kind);

    try {
      if (input.kind === "withdrawal") {
        const { accepted, response } = await pawapayPayout({
          payoutId: reference,
          amount: input.amount,
          currency: input.currency,
          phoneNumber: msisdn,
          provider: momoProvider,
          customerMessage: input.description,
        });
        if (!accepted) {
          return {
            status: "failed",
            reference,
            message:
              response.failureReason?.failureMessage ||
              `Retrait refusé (${response.status})`,
            provider: "momo",
            msisdn,
            momoProvider,
          };
        }
        return {
          status: "pending",
          reference,
          message: "Retrait initié. Confirmation sous peu sur votre téléphone.",
          provider: "momo",
          msisdn,
          momoProvider,
        };
      }

      const { accepted, response } = await pawapayDeposit({
        depositId: reference,
        amount: input.amount,
        currency: input.currency,
        phoneNumber: msisdn,
        provider: momoProvider,
        customerMessage: input.description,
      });
      if (!accepted) {
        return {
          status: "failed",
          reference,
          message:
            response.failureReason?.failureMessage ||
            `Paiement refusé (${response.status})`,
          provider: "momo",
          msisdn,
          momoProvider,
        };
      }
      return {
        status: "pending",
        reference,
        message:
          "Demande envoyée. Validez le paiement sur votre téléphone (Mobile Money).",
        provider: "momo",
        msisdn,
        momoProvider,
      };
    } catch (err) {
      return {
        status: "failed",
        reference,
        message: err instanceof Error ? err.message : "Erreur Mobile Money",
        provider: "momo",
        msisdn,
        momoProvider,
      };
    }
  },
};

export function getPaymentProvider(): PaymentProvider {
  if (process.env.YEKOOLA_PAYMENTS === "momo") return MomoPaymentProvider;
  return DemoPaymentProvider;
}

export function paymentsMode(): "demo" | "momo" {
  return process.env.YEKOOLA_PAYMENTS === "momo" ? "momo" : "demo";
}
