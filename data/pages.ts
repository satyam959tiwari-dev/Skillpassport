import type { PageMeta } from "@/types";

export const siteName = "SkillPassport";
export const siteTagline = "Verify Once. Be Trusted Everywhere.";
export const siteUrl = "https://skillspassport.ai";

export const pageMeta: Record<string, PageMeta> = {
  home: {
    title: "SkillPassport | Verify Once. Be Trusted Everywhere.",
    description:
      "SkillPassport connects verified credentials, proven skills, expert reviews, and career opportunities in one trusted ecosystem.",
    path: "/",
  },
  candidates: {
    title: "For Candidates | SkillPassport",
    description:
      "Explore SkillPassport for candidates: profile strength, documents and verification status, assessments and expert reviews, jobs, public sharing, referrals, support, and AI-assisted drafts—via a static interactive demo.",
    path: "/candidates/",
  },
  employers: {
    title: "For Employers | SkillPassport",
    description:
      "Find and evaluate talent using verified credentials, assessment outcomes, and expert reviews in one trust-focused hiring workflow.",
    path: "/employers/",
  },
  verifiers: {
    title: "For Verifiers | SkillPassport",
    description:
      "Operate credential verification with clear request workflows, status tracking, and accountable outcomes.",
    path: "/verifiers/",
  },
  reviewers: {
    title: "For Expert Reviewers | SkillPassport",
    description:
      "Apply expert judgment to assessments with rubrics, evidence review, and human-in-the-loop assistance.",
    path: "/reviewers/",
  },
  enterprises: {
    title: "For Enterprises | SkillPassport",
    description:
      "Explore Super Admin platform governance and Organization Admin tenant-scoped members, modules, and roles — kept as separate scopes.",
    path: "/enterprises/",
  },
  ai: {
    title: "AI on SkillPassport",
    description:
      "See how AI assists SkillPassport workflows—summaries, assessment guidance, and rubric drafts—while humans remain in control.",
    path: "/ai/",
  },
  trust: {
    title: "Trust & Security | SkillPassport",
    description:
      "Learn how SkillPassport approaches verification, governance, accountability, and human control across the trust ecosystem.",
    path: "/trust/",
  },
  contact: {
    title: "Contact | SkillPassport",
    description:
      "Get in touch about SkillPassport solutions. The on-site form runs in demo mode and does not transmit a real inquiry.",
    path: "/contact/",
  },
  createPassport: {
    title: "Create Your Passport | SkillPassport",
    description:
      "Build an illustrative digital Skill Passport—profile, skills, credentials, simulated verification, and assessment evidence—in a static interactive demo. No account or backend required.",
    path: "/create-passport/",
  },
  signIn: {
    title: "Sign in (demo) | SkillPassport",
    description:
      "Static sign-in demonstration for the SkillPassport marketing site. Validates locally and does not authenticate a real account.",
    path: "/sign-in/",
  },
};

export const contactTopics = [
  { id: "candidates", label: "Candidate questions" },
  { id: "employers", label: "Employer solutions" },
  { id: "verifiers", label: "Verification partnerships" },
  { id: "reviewers", label: "Expert reviewer interest" },
  { id: "enterprises", label: "Enterprise governance" },
  { id: "other", label: "Something else" },
] as const;
