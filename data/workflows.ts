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
    "People bring skills, credentials, and proof into one profile — more than a resume list.",
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
 * End-to-end SkillPassport story — seven steps, one per brief step, each owned by one role.
 * Conceptual order, not a mandatory click path. Ids are stable (used for icons/visuals).
 */
export const howItWorks: WorkflowStage[] = [
  {
    id: "build",
    label: "01",
    title: "Profile",
    description:
      "Candidates complete their profile — skills, experience, professional summary, and documents — and can choose to share it publicly.",
    outcomes: [
      "My Profile: skills, experience, summary",
      "Documents upload",
      "Visibility & share link",
    ],
  },
  {
    id: "verify",
    label: "02",
    title: "Verification",
    description:
      "Verifier companies check submitted documents and credentials in verification queues, with Super Admin oversight. Nothing counts as verified until it is checked.",
    outcomes: [
      "Apply Verification & Verification Board",
      "Awaiting Admin",
      "Verification status on the profile",
    ],
  },
  {
    id: "prove",
    label: "03",
    title: "Assessments",
    description:
      "Candidates take assessments to back up their skills — self-reviews, media submissions, and expert reviews built on a rubric or checklist.",
    outcomes: [
      "My Assessments",
      "Add Media",
      "Self-Reviews & Expert Reviews",
    ],
  },
  {
    id: "connect",
    label: "04",
    title: "Hiring",
    description:
      "Employers find candidates with Talent Search, move them from jobs to applicants to interviews, and attach company assessments to the process.",
    outcomes: [
      "Talent Search",
      "Jobs Management → Applicants → Interviews",
      "Company hiring assessments",
    ],
  },
  {
    id: "review",
    label: "05",
    title: "Scoring",
    description:
      "Reviewers grade each submission in rich workspaces — document preview, PDF annotation, and video review — scoring rubric criteria by level or checklist items as met / not met.",
    outcomes: [
      "Assessment / Media queue & My Reviews",
      "PDF annotation & video review",
      "Form preview & grading summary",
    ],
  },
  {
    id: "govern",
    label: "06",
    title: "Governance",
    description:
      "Admins approve sensitive outcomes — review results, assessment and media approval requests — and manage organizations, users and roles, audit, and affiliate campaigns.",
    outcomes: [
      "Review Results approval",
      "Organizations, Users & Roles, Permissions",
      "Audit Logs & Affiliate Management",
    ],
  },
  {
    id: "connected",
    label: "07",
    title: "Live updates",
    description:
      "Every role stays in sync — notifications, permission changes, and queue refreshes arrive without constant page reloads.",
    outcomes: [
      "Notifications inbox",
      "Permission changes",
      "Queue refreshes",
    ],
  },
];

export const valuePillars = [
  {
    id: "verify",
    title: "Verify Credentials",
    description: "A credential checked once keeps its verified status wherever the profile is shared or searched.",
  },
  {
    id: "prove",
    title: "Prove Skills",
    description: "Skills come with graded evidence on the profile, not just a line on a resume.",
  },
  {
    id: "hire",
    title: "Hire with Trust",
    description: "Employers shortlist on verified credentials and graded skills, with people making every decision.",
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
