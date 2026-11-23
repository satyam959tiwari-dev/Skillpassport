/** Tiny in-page event bus between the /ai hero, the capability grid and the demo lab. */
export const AI_DEMO_EVENT = "sp:ai-demo";
export const AI_AUDIENCE_EVENT = "sp:ai-audience";

export type AiRole = "candidate" | "reviewer" | "employer" | "admin";

/** Open a capability's interactive example in the demo lab (#demos). */
export function openAiDemo(demoId: string) {
  window.dispatchEvent(new CustomEvent(AI_DEMO_EVENT, { detail: demoId }));
  const target = document.getElementById("demos");
  if (target) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }
}

export function setAiAudience(role: AiRole | null) {
  window.dispatchEvent(new CustomEvent(AI_AUDIENCE_EVENT, { detail: role }));
}
