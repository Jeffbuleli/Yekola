/** Legacy seed file — préférer `lib/db/seed.ts` (Jeff / Patty). */

export const INSTRUCTOR = {
  id: "inst-jeff",
  name: "Jeff Buleli",
  role: "instructor" as const,
  title: "Formateur",
  academy: "Académie Jeff",
};

export const LEARNER = {
  id: "lrn-patty",
  name: "Patty Basoga",
  role: "learner" as const,
  city: "Kinshasa",
  goal: "Apprendre en ligne",
};

export const CERTIFICATE = {
  code: "YK-WEB-2026-JM01",
  learnerName: "Patty Basoga",
  pathTitle: "Développement Web Moderne",
  orgName: "Académie Jeff",
  instructorName: "Jeff Buleli",
  skills: ["Culture numérique", "HTML & CSS", "JavaScript"],
  issuedAt: "2026-09-20",
};
