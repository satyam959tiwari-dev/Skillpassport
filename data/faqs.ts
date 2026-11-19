import type { FaqItem } from "@/types";

export const faqs: FaqItem[] = [
  {
    id: "what-is",
    question: "What is SkillPassport?",
    answer:
      "SkillPassport is a verification-first multi-party platform connecting candidates, employers (job companies), verification organizations, expert reviewers, and platform/organization administrators in one trust workflow: verified profiles, assessments, credential checks, and hiring.",
    category: "product",
  },
  {
    id: "who-for",
    question: "Who uses SkillPassport?",
    answer:
      "Candidates, job companies, verifier companies, reviewers/trainers, super admins, and organization admins. Public visitors can open shareable profiles and guest review invites without logging in.",
    category: "product",
  },
  {
    id: "how-verify",
    question: "How does credential verification work?",
    answer:
      "Candidate documents enter verification queues. Verifier companies operate cases (apply, board, assigned/completed/on hold/escalated) with SLA-oriented reporting. Super-admin oversight keeps sensitive outcomes governed.",
    category: "trust",
  },
  {
    id: "assessments",
    question: "How do assessments and expert reviews work?",
    answer:
      "Candidates complete assessments, media submissions, and self-reviews. Reviewers grade with rubrics or checklists in workspaces that support documents, PDF annotation, and video. Some results require admin approval before they are visible.",
    category: "product",
  },
  {
    id: "ai-role",
    question: "What does AI do on SkillPassport?",
    answer:
      "AI assists drafts and discovery: candidate summary suggest, assessment suggestions, reviewer document→form import and form builder, employer good-practice query, and admin assessment template seeds. Humans edit, publish, and approve. This website only shows local illustrative demos—not live model calls.",
    category: "ai",
  },
  {
    id: "not-ai",
    question: "What is not generative AI?",
    answer:
      "Maps/places location autocomplete, curated Good Practices guidance cards, and human guest endorsements (which may need admin approval) are not generative AI features.",
    category: "ai",
  },
  {
    id: "replace-app",
    question: "Is this website the SkillPassport application?",
    answer:
      "No. This site is a static marketing and information experience. The product app is a separate React SPA with authentication, portals per role, and a backend API.",
    category: "product",
  },
  {
    id: "contact-demo",
    question: "Does the contact form send a real inquiry?",
    answer:
      "On this website the contact form runs in demo mode: it validates input and shows a simulated confirmation. It does not transmit a real inquiry.",
    category: "contact",
  },
];
