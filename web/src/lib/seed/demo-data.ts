/** Seed démo VUK'AFRIK - données RDC réalistes (pas Course 1 / User 2). */

export type SkillStatus = "validated" | "progress" | "todo";

export type Lesson = {
  id: string;
  moduleId: string;
  title: string;
  minutes: number;
  body: string;
  offlineReady: boolean;
};

export type Module = {
  id: string;
  order: number;
  title: string;
  summary: string;
  skillIds: string[];
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  skillId: string;
  difficulty: "beginner" | "intermediate";
};

export const ORG = {
  id: "org-silikin-demo",
  name: "Centre Digital Kinshasa (Démo)",
  type: "centre_formation",
  city: "Kinshasa",
  hubs: 1,
};

export const INSTRUCTOR = {
  id: "inst-sarah",
  name: "Sarah Ilunga",
  role: "instructor" as const,
  title: "Formatrice Développement Web",
  academy: "Académie Web Sarah",
};

export const LEARNER = {
  id: "lrn-jonathan",
  name: "Jonathan Mbuyi",
  role: "learner" as const,
  city: "Kinshasa",
  goal: "Devenir développeur Web",
};

export const SKILLS = [
  { id: "html", label: "HTML", status: "validated" as SkillStatus, score: 90 },
  { id: "css", label: "CSS", status: "validated" as SkillStatus, score: 80 },
  { id: "js", label: "JavaScript", status: "progress" as SkillStatus, score: 50 },
  { id: "git", label: "Git", status: "progress" as SkillStatus, score: 60 },
  { id: "responsive", label: "Responsive Design", status: "todo" as SkillStatus, score: 20 },
];

export const PATH = {
  id: "path-web-dev",
  slug: "developpeur-web",
  title: "Développement Web Moderne",
  tagline: "De la culture numérique au projet pour une PME de Kinshasa",
  durationWeeks: 6,
  audience: "Jeunes en formation professionnelle · débutants motivés",
};

export const MODULES: Module[] = [
  {
    id: "mod-1",
    order: 1,
    title: "Culture numérique",
    summary: "Internet, data, smartphones et sécurité de base en RDC.",
    skillIds: ["html"],
  },
  {
    id: "mod-2",
    order: 2,
    title: "HTML & CSS",
    summary: "Structurer et styliser une page pour une petite entreprise.",
    skillIds: ["html", "css", "responsive"],
  },
  {
    id: "mod-3",
    order: 3,
    title: "JavaScript",
    summary: "Fonctions, événements, validation de formulaires.",
    skillIds: ["js"],
  },
  {
    id: "mod-4",
    order: 4,
    title: "Git & GitHub",
    summary: "Versionner et partager son code.",
    skillIds: ["git"],
  },
  {
    id: "mod-5",
    order: 5,
    title: "Projet final",
    summary: "Landing page pour une PME congolaise - preuve employable.",
    skillIds: ["html", "css", "js", "responsive"],
  },
];

export const LESSONS: Lesson[] = [
  {
    id: "les-js-functions",
    moduleId: "mod-3",
    title: "Les fonctions JavaScript",
    minutes: 12,
    offlineReady: true,
    body: `## Objectif
Comprendre comment déclarer une fonction, passer des paramètres et utiliser \`return\`.

## Contexte RDC
Imagine un formulaire de commande Mobile Money pour une boutique à Kinshasa : tu valides le numéro avant d'envoyer.

## Concepts clés
1. **Déclaration** : \`function calculerTotal(prix, quantite) { ... }\`
2. **Paramètres** : valeurs reçues par la fonction
3. **return** : valeur renvoyée à l'appelant
4. **Portée** : variables \`let\`/\`const\` à l'intérieur ne sont pas visibles dehors

## Mini-exemple
\`\`\`js
function formaterCdf(montant) {
  return montant.toLocaleString("fr-CD") + " CDF";
}
formaterCdf(15000); // "15 000 CDF"
\`\`\`

## À retenir
Sans \`return\`, la fonction renvoie \`undefined\`. Les paramètres sont des copies locales.`,
  },
  {
    id: "les-html-intro",
    moduleId: "mod-2",
    title: "Structure HTML d'une landing PME",
    minutes: 10,
    offlineReady: true,
    body: `## Objectif
Créer la structure sémantique d'une page pour une PME (ex. atelier couture à Matonge).

## Balises essentielles
\`header\`, \`main\`, \`section\`, \`footer\`, \`h1\`-\`h3\`, \`p\`, \`a\`, \`img\` (avec \`alt\`).

## Astuce data
Images compressées, pas de vidéo HD autoplay - pensé smartphone 2G/3G.`,
  },
];

export const QUIZ_JS: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "Que renvoie une fonction JavaScript sans instruction return ?",
    choices: ["null", "undefined", "0", "false"],
    correctIndex: 1,
    explanation: "Sans return, la valeur est undefined.",
    skillId: "js",
    difficulty: "beginner",
  },
  {
    id: "q2",
    prompt: "Dans function add(a, b), a et b sont :",
    choices: ["Des variables globales", "Des paramètres", "Des propriétés d'objet", "Des classes"],
    correctIndex: 1,
    explanation: "a et b sont des paramètres de la fonction.",
    skillId: "js",
    difficulty: "beginner",
  },
  {
    id: "q3",
    prompt: "La portée (scope) d'une variable let déclarée dans une fonction :",
    choices: [
      "Est visible partout dans le fichier",
      "Est limitée au bloc/fonction",
      "Est partagée entre tous les apprenants",
      "N'existe qu'après sync cloud",
    ],
    correctIndex: 1,
    explanation: "let/const sont limitées au bloc où elles sont déclarées.",
    skillId: "js",
    difficulty: "intermediate",
  },
  {
    id: "q4",
    prompt: "Pour renvoyer « 15 000 CDF » depuis formaterCdf(15000), il faut :",
    choices: [
      "console.log uniquement",
      "return de la chaîne formatée",
      "alert()",
      "localStorage.setItem",
    ],
    correctIndex: 1,
    explanation: "return transmet la valeur à l'appelant.",
    skillId: "js",
    difficulty: "beginner",
  },
  {
    id: "q5",
    prompt: "Un paramètre de fonction est :",
    choices: [
      "Une valeur passée à l'appel",
      "Toujours une constante globale",
      "Un certificat Yekola",
      "Un événement de sync",
    ],
    correctIndex: 0,
    explanation: "Les paramètres reçoivent les arguments fournis à l'appel.",
    skillId: "js",
    difficulty: "beginner",
  },
];

export const PROJECT = {
  id: "proj-landing-pme",
  title: "Landing page pour une PME de Kinshasa",
  brief:
    "Construis une page d'accueil mobile-first pour « Atelier Nuru » (couture, Gombe) : offre, WhatsApp, horaires. HTML/CSS + un peu de JS (menu ou validation).",
  skills: ["html", "css", "js", "responsive"],
};

export const CERTIFICATE = {
  code: "YK-WEB-2026-JM01",
  learnerName: LEARNER.name,
  pathTitle: PATH.title,
  instructorName: INSTRUCTOR.name,
  orgName: ORG.name,
  issuedAt: "2026-09-20",
  skills: ["HTML", "CSS", "JavaScript", "Git", "Responsive Design"],
};

export const MEET_ROOM = "yekola-demo-web";

export function getLesson(id: string) {
  return LESSONS.find((l) => l.id === id);
}

export function getModule(id: string) {
  return MODULES.find((m) => m.id === id);
}
