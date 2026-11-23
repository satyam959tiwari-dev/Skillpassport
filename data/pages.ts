import type { PageMeta } from "@/types";

export const siteName = "SkillPassport";
export const siteTagline = "Verify Once. Be Trusted Everywhere.";
export const siteUrl = "https://skillspassport.ai";

export const pageMeta: Record<string, PageMeta> = {
  home: {
    title: "SkillPassport | Verify Once. Be Trusted Everywhere.",
    description:
      "Verify credentials · Prove skills · Hire with trust. One trust workflow for candidates, employers, verifiers, reviewers, and admins.",
    path: "/",
  },
  candidates: {
    title: "For Candidates | SkillPassport",
    description:
      "Build a verified profile: documents with tracked verification, assessments and expert reviews, Find Jobs, Refer & Earn, and AI help with your summary and assessment picks.",
    path: "/candidates/",
  },
  employers: {
    title: "For Employers | SkillPassport",
    description:
      "Talent Search, Jobs Management, Applicants, Interviews, and Reporting with Good Practice AI Query — hiring on verified skills and assessments.",
    path: "/employers/",
  },
  verifiers: {
    title: "For Verifiers | SkillPassport",
    description:
      "Run verification cases on the Verification Board — Apply Verification, Awaiting Admin, All Verifications — with SLA and accuracy reporting.",
    path: "/verifiers/",
  },
  reviewers: {
    title: "For Expert Reviewers | SkillPassport",
    description:
      "Build rubrics and checklists in the Forms library or with AI form import, then grade documents, PDFs, and video in structured review workspaces.",
    path: "/reviewers/",
  },
  enterprises: {
    title: "For Enterprises | SkillPassport",
    description:
      "Org tenants with Organization Admin, permissions, verification oversight, assessment approvals, audit, and affiliate — Super Admin and tenant scopes kept separate.",
    path: "/enterprises/",
  },
  ai: {
    title: "AI on SkillPassport",
    description:
      "Six AI capabilities — summary suggest, assessment suggestions, AI form import, AI Form Builder, Good Practice AI Query, assessment templates — always with human review.",
    path: "/ai/",
  },
  trust: {
    title: "Trust & Security | SkillPassport",
    description:
      "Verification workflow, admin approvals, audit logs, roles and permissions, email verification, and company-scoped data — trust built around people.",
    path: "/trust/",
  },
  contact: {
    title: "Contact | SkillPassport",
    description:
      "Talk with the SkillPassport team about candidates, hiring, verification, expert reviews, or enterprise governance. Send a message and a person from the team follows up.",
    path: "/contact/",
  },
  createPassport: {
    title: "Create Your Passport | SkillPassport",
    description:
      "Create your digital Skill Passport — profile, skills, credentials with verification status, and assessment evidence — in a few guided steps.",
    path: "/create-passport/",
  },
  signIn: {
    title: "Sign in | SkillPassport",
    description:
      "Sign in to SkillPassport — your profile, verifications, assessments, and jobs in one account.",
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
