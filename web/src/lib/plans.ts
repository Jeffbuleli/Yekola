import type { PlanId } from "./types";

export type Plan = {
  id: PlanId;
  name: string;
  /** Prix mensuel en francs congolais (FC). Free = 0. */
  priceCdf: number;
  /** Même abonnement en Pi. 1 π = 1 000 FC. 100 % revient à Yekola. */
  pricePi: number;
  maxCourses: number | null;
  maxLearners: number | null;
  /** Part Yekola sur le paiement de l’apprenant. Le reste crédite l’enseignant. */
  commissionPercent: number;
  blurb: string;
  features: string[];
  highlighted?: boolean;
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    priceCdf: 0,
    pricePi: 0,
    maxCourses: 1,
    maxLearners: 15,
    commissionPercent: 20,
    blurb: "Lancez votre académie et validez votre premier cours.",
    features: [
      "1 cours actif",
      "Jusqu’à 15 apprenants",
      "Quiz et pack offline",
      "Encaissement Pi ou Mobile Money",
      "Commission 20 %",
    ],
  },
  {
    id: "base",
    name: "Base",
    priceCdf: 1000,
    pricePi: 1,
    maxCourses: 3,
    maxLearners: 50,
    commissionPercent: 10,
    blurb: "Pour les formateurs qui lancent sérieusement.",
    features: [
      "Jusqu’à 3 cours actifs",
      "Jusqu’à 50 apprenants",
      "Pack offline par cours",
      "Stats de ventes",
      "Commission 10 %",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    priceCdf: 1500,
    pricePi: 1.5,
    maxCourses: 10,
    maxLearners: 200,
    commissionPercent: 5,
    blurb: "Pour les académies en croissance.",
    highlighted: true,
    features: [
      "Jusqu’à 10 cours actifs",
      "Jusqu’à 200 apprenants",
      "Certificats automatiques",
      "Support prioritaire",
      "Commission 5 %",
    ],
  },
  {
    id: "max",
    name: "Max",
    priceCdf: 2000,
    pricePi: 2,
    maxCourses: null,
    maxLearners: null,
    commissionPercent: 0,
    blurb: "Illimité pour les grandes académies.",
    features: [
      "Cours illimités",
      "Apprenants illimités",
      "0 % de commission",
      "Domaine personnalisé (bientôt)",
      "Accompagnement dédié",
    ],
  },
];

export function getPlan(id: PlanId): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

export function canPublishCourse(planId: PlanId, publishedCount: number): boolean {
  const plan = getPlan(planId);
  if (plan.maxCourses == null) return true;
  return publishedCount < plan.maxCourses;
}

/** Affichage montants FC (ex. 1 000 FC). */
export function formatFc(amount: number): string {
  const n = Math.round(amount);
  return `${n.toLocaleString("fr-CD")} FC`;
}

/** 1 π = 1 000 FC. Les cours suivent le même barème que l’abonnement. */
export function cdfToPi(amountCdf: number): number {
  if (amountCdf <= 0) return 0;
  return Math.round((amountCdf / 1000) * 100) / 100;
}

export function formatPi(amount: number): string {
  const n = Math.round(amount * 100) / 100;
  return `${n.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} π`;
}

/** Part plateforme / part enseignant sur un paiement apprenant en Pi. */
export function splitPiPayment(grossPi: number, commissionPercent: number): {
  feePi: number;
  teacherNetPi: number;
} {
  const gross = Math.round(grossPi * 100) / 100;
  const feePi = Math.round(gross * (commissionPercent / 100) * 100) / 100;
  const teacherNetPi = Math.round((gross - feePi) * 100) / 100;
  return { feePi, teacherNetPi };
}
