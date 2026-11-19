import type { AudienceSolution } from "@/types";

export const audiences: AudienceSolution[] = [
  {
    id: "candidates",
    title: "Candidates",
    eyebrow: "For professionals",
    headline: "Build a profile that shows not only who you are, but what you can prove.",
    accentWord: "prove",
    summary:
      "Focus on verified identity, skills, documents, assessments, reviews, jobs, applications, and AI support — with a static interactive demo of the candidate portal.",
    href: "/candidates/",
    benefits: [
      "Dashboard with profile strength, photo, visibility, and optional share link",
      "Documents with tracked verification status—upload is not automatic verification",
      "My Assessments, Add Media, Self-Reviews, and Expert Reviews for skill evidence",
      "Find Jobs, Saved Jobs, Applications, Refer & Earn, notifications, and Raise Query",
      "AI summary drafts and assessment suggestions (draft → Use template)—always editable",
      "Public profiles and guest review invites; some outcomes need approval before you see them",
    ],
    features: [
      "Dashboard & profile strength",
      "My Profile (edit, photo, visibility, share link)",
      "Documents & verification status",
      "My Assessments · Add Media · Self-Reviews · Expert Reviews",
      "Applications · Find Jobs · Saved Jobs",
      "AI summary + AI assessment suggestions (draft / Use template)",
      "Public profile · Guest reviews · Refer & Earn",
      "Notifications · Settings · Raise Query · Support tickets",
    ],
    primaryCta: { label: "Create Your Passport", href: "/create-passport/" },
    secondaryCta: { label: "Explore interactive demo", href: "#demo" },
    footerCta: { label: "Create Your Passport", href: "/create-passport/" },
  },
  {
    id: "employers",
    title: "Employers",
    eyebrow: "For job companies",
    headline: "Hire with more confidence when skills and credentials are supported by trust.",
    accentWord: "trust",
    summary:
      "Focus on talent search, jobs, applicants, interviews, assessments, reporting, and skill gaps — including an optional AI good-practice query that stays human-reviewed.",
    href: "/employers/",
    benefits: [
      "Talent search across verified skill signals",
      "Jobs → applicants → interviews in one workflow",
      "Company assessments and team reviewer seats",
      "Reporting for skill performance and gaps",
    ],
    features: [
      "Talent Search",
      "Jobs Management (screening, skills, locations, publish)",
      "Applicants & Interviews",
      "Company Assessments & My Reviews",
      "Team Management (invite, roles, seats)",
      "Reporting + AI good-practice query (illustrative)",
    ],
    primaryCta: { label: "Explore hiring demo", href: "#demo" },
    secondaryCta: { label: "Contact us", href: "/contact/" },
    footerCta: { label: "Talk about employer solutions", href: "/contact/" },
  },
  {
    id: "verifiers",
    title: "Verifiers",
    eyebrow: "For verification companies",
    headline: "Bring structure, visibility, and accountability to verification.",
    accentWord: "accountability",
    summary:
      "Focus on workflows, cases, SLAs, accuracy, and governance — apply cases, await admin gates, work the verification board, and report outcomes.",
    href: "/verifiers/",
    benefits: [
      "Case board for assigned, completed, on-hold, and escalated work",
      "Tracked case statuses with board, filters, and reporting context",
      "Team seats for verifier company operations",
      "Reports for volume, accuracy, and SLA",
    ],
    features: [
      "Apply Verification · Awaiting Admin · Verification Board",
      "All Verifications (assigned, completed, on hold, escalated)",
      "Verification volume / accuracy / SLA reports",
      "Company profile, team, notifications, queries",
    ],
    primaryCta: { label: "Explore verification board", href: "#demo" },
    secondaryCta: { label: "Contact us", href: "/contact/" },
    footerCta: { label: "Talk about verification partnerships", href: "/contact/" },
  },
  {
    id: "reviewers",
    title: "Expert Reviewers",
    eyebrow: "For reviewers & L&D",
    headline: "Turn expertise into consistent, structured, and scalable skill evaluation.",
    accentWord: "structured",
    summary:
      "Focus on rubrics, checklists, review queues, rich media review, and AI form workflows — with human control over publish.",
    href: "/reviewers/",
    benefits: [
      "Forms library: rubrics, checklists, weighted criteria",
      "Assessment / media queues and My Reviews",
      "Deep review UX for docs, PDF, and video",
      "AI document import to draft forms—then refine before publish",
    ],
    features: [
      "Assessment / Media queue · My Reviews · Reporting",
      "Manual rubric/checklist builder",
      "AI form import + AI Form Builder (illustrative)",
      "Good Practices · Guidelines · Help Center",
      "Form preview, grading summary, media workflows",
    ],
    primaryCta: { label: "Explore reviewer tools", href: "#demo" },
    secondaryCta: { label: "Contact us", href: "/contact/" },
    footerCta: { label: "Talk about reviewer tools", href: "/contact/" },
  },
  {
    id: "enterprises",
    title: "Enterprises",
    eyebrow: "For org & platform admins",
    headline: "Govern trust at scale.",
    accentWord: "Govern",
    summary:
      "Focus on multi-tenancy, users, roles, permissions, governance, and audit. Super Admin is platform-wide; Organization Admin stays tenant-scoped to members, modules, and roles.",
    href: "/enterprises/",
    benefits: [
      "Super Admin: platform KPIs, people inventory, verification oversight, approval gates",
      "Super Admin: organizations, permissions, audit logs, affiliates, assessment templates",
      "Organization Admin: members, available modules, and scoped roles for one tenant",
      "Clear separation — Org Admin does not inherit platform-wide Super Admin powers",
    ],
    features: [
      "Super Admin · Platform Dashboard · People & Hiring",
      "Super Admin · Verification · Approvals · Review Management",
      "Super Admin · Orgs · Permissions · Billing modules · Affiliates · Audit",
      "Organization Admin · Members · Modules · Scoped roles",
    ],
    primaryCta: { label: "Explore admin domains", href: "#demo" },
    secondaryCta: { label: "Contact us", href: "/contact/" },
    footerCta: { label: "Talk about enterprise governance", href: "/contact/" },
  },
];

export function getAudience(id: AudienceSolution["id"]) {
  const audience = audiences.find((item) => item.id === id);
  if (!audience) throw new Error(`Unknown audience: ${id}`);
  return audience;
}
