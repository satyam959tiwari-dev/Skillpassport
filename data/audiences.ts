import type { AudienceSolution } from "@/types";

export const audiences: AudienceSolution[] = [
  {
    id: "candidates",
    title: "Candidates",
    eyebrow: "For professionals",
    headline: "Build a profile that shows not only who you are, but what you can prove.",
    accentWord: "prove",
    summary:
      "Verified documents, assessments and expert reviews, jobs and applications, Refer & Earn, and AI help with your summary and assessment picks.",
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
    secondaryCta: { label: "Try the candidate workspace", href: "#demo" },
    footerCta: { label: "Create Your Passport", href: "/create-passport/" },
  },
  {
    id: "employers",
    title: "Employers",
    eyebrow: "For job companies",
    headline: "Hire with more confidence when skills and credentials are supported by trust.",
    accentWord: "trust",
    summary:
      "Talent Search, Jobs Management, Applicants, Interviews, company assessments, and Reporting — with Good Practice AI Query to close skill gaps.",
    href: "/employers/",
    benefits: [
      "Talent Search across verified skills and credentials",
      "Jobs → applicants → interviews in one workflow",
      "Company assessments and team reviewer seats",
      "Reporting on team skill performance and gaps",
    ],
    features: [
      "Talent Search",
      "Jobs Management (screening, skills, locations, publish)",
      "Applicants & Interviews",
      "Company Assessments & My Reviews",
      "Team Management (invite, roles, seats)",
      "Reporting + Good Practice AI Query",
    ],
    primaryCta: { label: "Try the hiring workspace", href: "#demo" },
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
      "Apply Verification, work the Verification Board, track SLAs, and report volume and accuracy — with Awaiting Admin oversight on sensitive outcomes.",
    href: "/verifiers/",
    benefits: [
      "Case board for assigned, completed, on-hold, and escalated work",
      "Apply Verification and Awaiting Admin for cases that need platform sign-off",
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
      "Build rubrics and checklists manually or with AI form import, work the Assessment / Media queue, and review documents, PDFs, and video — you control publish.",
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
      "AI form import + AI Form Builder",
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
      "Run org tenants with Organization Admin, permissions, verification oversight, assessment approvals, audit, and affiliate — Super Admin platform-wide, tenants scoped.",
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
