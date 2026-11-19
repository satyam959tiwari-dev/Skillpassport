import type { FeatureItem, TrustPrinciple } from "@/types";

export const platformFeatures: FeatureItem[] = [
  {
    id: "profiles",
    title: "Verified skill profiles",
    description:
      "Candidates build profiles with skills, experience, documents, visibility controls, and optional public share links.",
    audience: "candidates",
  },
  {
    id: "credential-checks",
    title: "Verification operations",
    description:
      "Verifier companies run case boards with statuses, escalations, and SLA-oriented reporting under admin oversight.",
    audience: "verifiers",
  },
  {
    id: "assessments",
    title: "Assessments & rich reviews",
    description:
      "Self-reviews, media submissions, and expert grading with rubrics/checklists—including PDF and video review workspaces.",
    audience: "all",
  },
  {
    id: "employer-hire",
    title: "Jobs, applicants & interviews",
    description:
      "Job companies post roles, search talent, manage applicants, schedule interviews, and attach assessments to hiring.",
    audience: "employers",
  },
  {
    id: "expert-reviews",
    title: "Forms, rubrics & reviewer queues",
    description:
      "Reviewers design forms manually or from AI import drafts, then grade in structured workspaces with publish control.",
    audience: "reviewers",
  },
  {
    id: "org-governance",
    title: "Admin governance",
    description:
      "Super Admin covers platform-wide orgs, approvals, audit, billing modules, and affiliates. Organization Admin stays tenant-scoped to members, modules, and roles.",
    audience: "enterprises",
  },
];

export const trustPrinciples: TrustPrinciple[] = [
  {
    id: "verify-once",
    title: "Verify once. Be trusted everywhere.",
    description:
      "Reusable trust: centralized profile and verification state so credential signals travel across opportunities with context — not automatic success on upload.",
  },
  {
    id: "human-control",
    title: "Humans remain in control",
    description:
      "AI drafts and suggests. Verification, expert grading, and sensitive approvals stay with accountable people and admins.",
  },
  {
    id: "governed-workflows",
    title: "Trust is governed, not simply generated",
    description:
      "Guest endorsements, review results, and media can require admin approval before visibility. Queues, permissions, and audit logs keep trust inspectable.",
  },
  {
    id: "role-clarity",
    title: "Clear roles across the ecosystem",
    description:
      "Candidates, employers, verifiers, reviewers, super admins, and organization admins each have defined responsibilities.",
  },
];

export const productExperiences = [
  {
    id: "passport",
    title: "Candidate passport view",
    description:
      "Illustrative layout for profile strength, documents, assessments, and share visibility—not a live app screenshot.",
    panels: ["Profile strength", "Document status", "Assessments & reviews"],
    href: "/candidates/",
  },
  {
    id: "employer",
    title: "Employer hiring view",
    description:
      "Illustrative layout for talent search, applicants, and interview context.",
    panels: ["Talent search", "Applicants pipeline", "Interview schedule"],
    href: "/employers/",
  },
  {
    id: "ops",
    title: "Verification & admin view",
    description:
      "Illustrative queue for verification cases and approval gates.",
    panels: ["Verification board", "Approval requests", "Audit context"],
    href: "/verifiers/",
  },
] as const;

export const problemPoints = [
  {
    title: "Claims without proof",
    description:
      "Hiring and compliance often rely on resumes and assertions that are hard to verify consistently.",
  },
  {
    title: "Fragmented trust signals",
    description:
      "Skills, certificates, assessments, reviews, and job pipelines usually live in separate systems.",
  },
  {
    title: "Unclear accountability",
    description:
      "Without verifier, reviewer, and admin roles—plus approval gates—trust becomes informal and uneven.",
  },
] as const;
