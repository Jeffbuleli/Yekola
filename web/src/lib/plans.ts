import type { PlanId } from "./types";

export type Plan = {
  id: PlanId;
  name: string;
  /** Prix mensuel en francs congolais (FC). Free = 0. */
  priceCdf: number;
  maxCourses: number | null;
  maxLearners: number | null;
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
    maxCourses: 1,
    maxLearners: 15,
    commissionPercent: 20,
    blurb: "Lancez votre académie et validez votre premier cours.",
    features: [
      "1 cours actif",
      "Jusqu’à 15 apprenants",
      "Quiz et pack offline",
      "Encaissement Mobile Money",
      "Commission 20 %",
    ],
  },
  {
    id: "base",
    name: "Base",
    priceCdf: 1000,
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
