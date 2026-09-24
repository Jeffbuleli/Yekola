import { chatJSON, getAIProviderName } from "@/lib/ai/provider";

export type TutorContext = {
  learnerName: string;
  pathTitle: string;
  moduleTitle: string;
  lessonTitle: string;
  quizScore?: string;
  weakTopics?: string[];
  question: string;
};

export async function askTutor(ctx: TutorContext) {
  const system = `Tu es Yekola AI Tutor, tuteur pédagogique pour la formation professionnelle en RDC.
Tu connais le parcours de l'apprenant. Réponds en français, clair, encourageant, avec un mini-exercice pratique ancré en Afrique (Mobile Money, PME, smartphone).
Ne invente pas de notes. Ne publie rien. Ne délivre pas de certificat.
Provider: ${getAIProviderName()}.`;

  const user = `Apprenant: ${ctx.learnerName}
Parcours: ${ctx.pathTitle}
Module: ${ctx.moduleTitle}
Leçon: ${ctx.lessonTitle}
Score quiz récent: ${ctx.quizScore || "non disponible"}
Difficultés signalées: ${(ctx.weakTopics || []).join(", ") || "non précisées"}

Question: ${ctx.question}`;

  const answer = await chatJSON(system, user);
  return { provider: getAIProviderName(), answer };
}
