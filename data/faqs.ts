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
      "Six capabilities only: Suggest with AI for the professional summary, AI assessment suggestions, AI form import, AI Form Builder, Good Practice AI Query, and AI-assisted assessment templates. People edit, publish, and approve every output.",
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
      "This site explains SkillPassport and lets you try each role's workspace. The application itself has sign-in and a dedicated portal for every role.",
    category: "product",
  },
  {
    id: "contact-demo",
    question: "Does the contact form send a real inquiry?",
    answer:
      "Yes. Messages sent from the contact page go straight to the SkillPassport team, and you receive an email confirmation with a reference number. A person from the team follows up.",
    category: "contact",
  },
];
