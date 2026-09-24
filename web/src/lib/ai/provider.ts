import OpenAI from "openai";

export type AIProviderName = "openai" | "demo";

export function getAIProviderName(): AIProviderName {
  return process.env.OPENAI_API_KEY?.trim() ? "openai" : "demo";
}

export function getOpenAI(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

export async function chatJSON(system: string, user: string): Promise<string> {
  const client = getOpenAI();
  if (!client) {
    return demoReply(system, user);
  }
  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
    temperature: 0.4,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  return completion.choices[0]?.message?.content?.trim() || demoReply(system, user);
}

function demoReply(system: string, user: string): string {
  const lower = `${system}\n${user}`.toLowerCase();
  if (lower.includes("quiz") && lower.includes("génér")) {
    return JSON.stringify({
      provider: "demo",
      questions: [
        {
          prompt: "Qu'est-ce qu'une fonction en JavaScript ?",
          choices: ["Un type de boucle", "Un bloc réutilisable de code", "Un fichier CSS", "Un serveur"],
          correctIndex: 1,
          explanation: "Une fonction regroupe des instructions réutilisables.",
          skillId: "js",
          difficulty: "beginner",
        },
      ],
    });
  }
  if (lower.includes("syllabus") || lower.includes("course builder") || lower.includes("modules")) {
    return JSON.stringify({
      provider: "demo",
      title: "Introduction à la cybersécurité",
      description: "Bases de la cybersécurité pour débutants en RDC.",
      objectives: [
        "Reconnaître les menaces courantes (phishing, malware)",
        "Sécuriser un smartphone et un compte Mobile Money",
        "Appliquer les bonnes pratiques de mots de passe",
      ],
      prerequisites: ["Savoir utiliser un smartphone"],
      modules: [
        { title: "Menaces du quotidien", lessons: ["Phishing WhatsApp", "Faux liens MoMo"] },
        { title: "Protéger ses comptes", lessons: ["Mots de passe", "2FA basique"] },
        { title: "Projet", lessons: ["Checklist sécurité pour une PME"] },
      ],
      finalProject: "Créer une checklist cybersécurité pour une boutique à Kinshasa",
      skills: ["Sécurité numérique", "Hygiène des comptes", "Sensibilisation"],
    });
  }
  // Tutor default - contextual to JS functions + weak quiz
  return `Tu travailles sur le module **JavaScript - Les fonctions** (parcours Développement Web Moderne).

D'après ton dernier quiz, tu as environ **4/10** : les difficultés semblent porter sur :
- les **paramètres**
- l'instruction **return**
- la **portée** des variables

Exemple concret (boutique Kinshasa) :
\`\`\`js
function totalCommande(prixUnitaire, qte) {
  return prixUnitaire * qte;
}
\`\`\`
Sans \`return\`, tu n'obtiens pas le montant à afficher en CDF.

Veux-tu un exercice de 5 minutes : écrire \`formaterCdf(montant)\` qui renvoie une chaîne du type \`"15 000 CDF"\` ?

_(Mode DEMO - configure OPENAI_API_KEY pour Yekola AI live.)_`;
}
