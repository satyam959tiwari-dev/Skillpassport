/** In-page bridge: contact hero / route cards → preselect the contact form topic. */
export const CONTACT_TOPIC_EVENT = "sp:contact-topic";

export const contactRoutes = [
  { id: "product", label: "Product & Partnerships", topic: "other", hint: "Product questions, integrations and partnerships" },
  { id: "verification", label: "Verification & Reviews", topic: "verifiers", hint: "Verifier companies and expert reviewers" },
  { id: "enterprise", label: "Enterprise & Governance", topic: "enterprises", hint: "Multi-tenant setup, roles and approvals" },
] as const;

export type ContactRouteId = (typeof contactRoutes)[number]["id"];

/** Preselect a topic in the contact form and bring the form into view. */
export function chooseContactRoute(id: ContactRouteId) {
  const route = contactRoutes.find((r) => r.id === id);
  if (!route) return;
  window.dispatchEvent(new CustomEvent(CONTACT_TOPIC_EVENT, { detail: route.topic }));
  const form = document.getElementById("contact-form");
  if (form) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    form.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }
}
