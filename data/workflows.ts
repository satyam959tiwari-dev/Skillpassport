import type { WorkflowStage } from "@/types";

/**
 * Trust-layer nodes — matches core positioning:
 * Skills · Credentials · Assessments · Expert reviews · Verification ·
 * Organizations · People · Opportunities
 */
export const skillNetworkNodes = [
  { id: "candidate", label: "People", x: 8, y: 50 },
  { id: "skills", label: "Skills", x: 24, y: 22 },
  { id: "credential", label: "Credentials", x: 42, y: 12 },
  { id: "assessment", label: "Assessments", x: 58, y: 22 },
  { id: "review", label: "Expert Review", x: 76, y: 34 },
  { id: "verification", label: "Verification", x: 58, y: 52 },
  { id: "organization", label: "Organizations", x: 88, y: 58 },
  { id: "employer", label: "Employers", x: 42, y: 78 },
  { id: "opportunity", label: "Opportunities", x: 22, y: 88 },
] as const;

/** Conceptual connections — not a mandatory lifecycle order. */
export const skillNetworkEdges: Array<[string, string]> = [
  ["candidate", "skills"],
  ["candidate", "credential"],
  ["skills", "assessment"],
  ["credential", "verification"],
  ["assessment", "review"],
  ["review", "verification"],
  ["verification", "employer"],
  ["skills", "employer"],
  ["assessment", "employer"],
  ["employer", "opportunity"],
  ["candidate", "opportunity"],
  ["organization", "verification"],
  ["organization", "employer"],
  ["organization", "review"],
];

/** Short blurbs when a network node is selected. */
export const skillNetworkCopy: Record<string, string> = {
  candidate:
    "People bring skills, credentials, and proof into one profile — more than a résumé list.",
  skills: "Skills are the capabilities candidates claim and employers search for.",
  credential:
    "Credentials and documents enter verification — status is tracked, not assumed true on upload.",
  assessment:
    "Assessments, media, and self-reviews turn skill claims into structured evidence.",
  review:
    "Expert reviewers grade with rubrics and checklists — human judgment, not AI-only scores.",
  verification:
    "Verifier companies and admin oversight keep credential outcomes accountable.",
  organization:
    "Organizations and admins govern modules, members, roles, and approvals at the right scope.",
  employer:
    "Employers run talent search, jobs, applicants, and interviews on trusted signals.",
  opportunity:
    "Trusted profiles connect people to jobs and career opportunities — not a keyword-only board.",
};

/**
 * End-to-end SkillPassport story.
 * Conceptual — not a mandatory click path or product state machine.
 */
export const howItWorks: WorkflowStage[] = [
  {
    id: "build",
    label: "01",
    title: "Build",
    description:
      "Create a professional profile with skills, experience, professional summary, documents, and credentials — plus optional public sharing.",
    outcomes: [
      "Skills & experience",
      "Professional summary",
      "Documents & credentials",
    ],
  },
  {
    id: "verify",
    label: "02",
    title: "Verify",
    description:
      "Validate documents and credentials through structured verification workflows. Verify once. Reuse everywhere.",
    outcomes: [
      "Verification queues & board",
      "Tracked status (not auto-success)",
      "Reusable trust with context",
    ],
  },
  {
    id: "prove",
    label: "03",
    title: "Prove",
    description:
      "Demonstrate skills through assessments, self-reviews, media submissions, and expert reviews — with rubrics, checklists, weighted criteria, performance levels, and mandatory gates.",
    outcomes: [
      "Assessments & self-reviews",
      "Media submissions",
      "Expert reviews with structure",
    ],
  },
  {
    id: "connect",
    label: "04",
    title: "Connect",
    description:
      "Employers search talent, create jobs, manage applicants, conduct interviews, and use assessments in hiring.",
    outcomes: [
      "Talent search",
      "Jobs → applicants → interviews",
      "Hiring assessments",
    ],
  },
  {
    id: "review",
    label: "05",
    title: "Review",
    description:
      "Reviewers work with documents, PDFs, video, rubrics, checklists, form previews, and grading summaries.",
    outcomes: [
      "Rich media review workspaces",
      "Rubrics & checklists",
      "Form preview & grading summary",
    ],
  },
  {
    id: "govern",
    label: "06",
    title: "Govern",
    description:
      "Administrators manage approvals, organizations, roles, permissions, verification oversight, review outcomes, audit activity, and affiliate programs — Super Admin and Organization Admin stay separate scopes.",
    outcomes: [
      "Approvals & audit",
      "Orgs, roles & permissions",
      "Affiliates & oversight",
    ],
  },
  {
    id: "connected",
    label: "07",
    title: "Stay Connected",
    description:
      "In the product app, realtime updates keep notifications, permission changes, verification and assessment queues, team membership, organization changes, and affiliate campaigns in sync. This marketing site explains that capability — it does not simulate live sockets.",
    outcomes: [
      "Notifications & queues",
      "Team & org changes",
      "Affiliate campaign updates",
    ],
  },
];

export const valuePillars = [
  {
    id: "verify",
    title: "Verify Credentials",
    description: "Verify once. Use everywhere.",
  },
  {
    id: "prove",
    title: "Prove Skills",
    description: "Show what you can do.",
  },
  {
    id: "hire",
    title: "Hire with Trust",
    description: "Make better decisions with trusted talent information.",
  },
] as const;

/** Audience roles named in core positioning. */
export const ecosystemAudiences = [
  { label: "Candidates", href: "/candidates/" },
  { label: "Employers", href: "/employers/" },
  { label: "Verifier Companies", href: "/verifiers/" },
  { label: "Reviewers / Trainers", href: "/reviewers/" },
  { label: "Super Admin", href: "/enterprises/" },
  { label: "Organization Admin", href: "/enterprises/" },
] as const;

/** Trust-layer connections named in core positioning. */
export const ecosystemConnections = [
  "Skills",
  "Credentials",
  "Assessments",
  "Expert reviews",
  "Verification",
  "Organizations",
  "People",
  "Opportunities",
] as const;
