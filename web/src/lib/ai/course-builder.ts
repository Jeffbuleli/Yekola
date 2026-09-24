import { chatJSON, getAIProviderName } from "@/lib/ai/provider";

export async function generateCourse(input: {
  subject: string;
  audience: string;
  weeks: number;
  objective: string;
}) {
  const system = `Tu es Yekola AI Course Builder. Propose un syllabus JSON (pas de markdown) pour formateurs en RDC.
Champs: title, description, objectives[], prerequisites[], modules[{title, lessons[]}], finalProject, skills[].
L'humain valide avant publication. Ne publie jamais. Provider: ${getAIProviderName()}.`;
  const user = JSON.stringify(input);
  const raw = await chatJSON(system, user);
  try {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    const json = JSON.parse(raw.slice(start, end + 1));
    return { provider: getAIProviderName(), draft: json, status: "draft_needs_human_review" as const };
  } catch {
    return {
      provider: getAIProviderName(),
      draft: { raw },
      status: "draft_needs_human_review" as const,
    };
  }
}
