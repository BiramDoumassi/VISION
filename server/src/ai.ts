// VISION AI — questions en langage naturel sur les données du client.
// Le modèle est open-weight et hébergé sur site (Ollama, vLLM, llama.cpp… : toute API compatible /v1/chat/completions).
// VISION AI est consultative : elle répond et cite, elle n'exécute jamais d'action (Tier 2 inchangé).
import { z } from "zod";

export const aiConfigured = () => !!process.env.AI_BASE_URL;

const item = z.object({ id: z.string().max(80), label: z.string().max(200), detail: z.string().max(400).optional() });
export const AskIn = z.object({
  question: z.string().min(2).max(500),
  locale: z.enum(["fr", "en"]),
  context: z.object({
    client: z.string().max(200),
    date: z.string().max(20),
    alerts: z.array(item).max(200),
    suppliers: z.array(item).max(2000),
    sites: z.array(item).max(500),
    events: z.array(item).max(500),
  }),
});
export type AskInput = z.infer<typeof AskIn>;
export type AskOutput = { mode: "model"; answer: string; entityIds: string[]; model: string };

const SYSTEM = {
  fr: `Tu es VISION AI, assistant d'analyse de risques d'approvisionnement pour un industriel.
Règles impératives :
- Tu réponds uniquement à partir du contexte fourni (sites, fournisseurs, alertes, événements). Si l'information n'y est pas, dis-le.
- Tu es consultatif : tu proposes, tu n'exécutes rien et tu ne prétends jamais avoir agi. Toute décision reste humaine.
- Tu refuses toute aide au ciblage, au suivi de personnes ou à une action offensive.
- Réponse courte (5 phrases au plus), en français, factuelle.
Réponds STRICTEMENT en JSON : {"answer": "...", "entityIds": ["id", ...]} où entityIds liste les identifiants du contexte concernés par ta réponse.`,
  en: `You are VISION AI, a supply-risk analysis assistant for a manufacturer.
Mandatory rules:
- Answer only from the provided context (sites, suppliers, alerts, events). If the information is not there, say so.
- You are advisory: you suggest, you never execute anything and never claim to have acted. Every decision stays human.
- Refuse any help with targeting, tracking people or offensive action.
- Short answer (5 sentences at most), in English, factual.
Reply STRICTLY as JSON: {"answer": "...", "entityIds": ["id", ...]} where entityIds lists the context ids your answer concerns.`,
};

export async function ask(input: AskInput): Promise<AskOutput> {
  const base = process.env.AI_BASE_URL!.replace(/\/$/, "");
  const model = process.env.AI_MODEL ?? "mistral-small";
  const ctx = JSON.stringify(input.context);
  const r = await fetch(`${base}/v1/chat/completions`, {
    method: "POST",
    signal: AbortSignal.timeout(Number(process.env.AI_TIMEOUT_MS ?? 60_000)),
    headers: { "content-type": "application/json", ...(process.env.AI_API_KEY ? { authorization: `Bearer ${process.env.AI_API_KEY}` } : {}) },
    body: JSON.stringify({
      model, temperature: 0.1, max_tokens: 600,
      messages: [
        { role: "system", content: SYSTEM[input.locale] },
        { role: "user", content: `CONTEXTE:\n${ctx}\n\nQUESTION:\n${input.question}` },
      ],
    }),
  });
  if (!r.ok) throw new Error(`Modèle indisponible (HTTP ${r.status})`);
  const data = await r.json() as { choices?: { message?: { content?: string } }[] };
  const raw = data.choices?.[0]?.message?.content ?? "";
  // Les modèles locaux entourent parfois le JSON de texte : on extrait le premier objet.
  let parsed: { answer?: unknown; entityIds?: unknown } = {};
  try { parsed = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1)); } catch { parsed = { answer: raw }; }
  const known = new Set([...input.context.alerts, ...input.context.suppliers, ...input.context.sites, ...input.context.events].map((x) => x.id));
  const ids = Array.isArray(parsed.entityIds) ? parsed.entityIds.filter((x): x is string => typeof x === "string" && known.has(x)) : [];
  return { mode: "model", answer: String(parsed.answer ?? "").slice(0, 2000), entityIds: [...new Set(ids)].slice(0, 50), model };
}
