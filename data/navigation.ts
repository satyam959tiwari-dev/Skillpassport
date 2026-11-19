import type { NavGroup, NavLink } from "@/types";

export const primaryNav: NavGroup[] = [
  {
    label: "Solutions",
    children: [
      {
        label: "For Candidates",
        href: "/candidates/",
        description: "Build a verified skill profile and prove what you can do.",
      },
      {
        label: "For Employers",
        href: "/employers/",
        description: "Jobs, talent search, applicants, interviews, reporting.",
      },
      {
        label: "For Verifiers",
        href: "/verifiers/",
        description: "Verification boards, cases, SLA-oriented reporting.",
      },
      {
        label: "For Reviewers",
        href: "/reviewers/",
        description: "Rubrics, checklists, AI form import, rich review UX.",
      },
      {
        label: "Enterprises & Admins",
        href: "/enterprises/",
        description: "Super Admin governance and Organization Admin scoped access.",
      },
    ],
  },
  {
    label: "Platform",
    children: [
      {
        label: "Create Your Passport",
        href: "/create-passport/",
        description: "Interactive demo: build an illustrative digital Skill Passport.",
      },
      {
        label: "How it works",
        href: "/#how-it-works",
        description: "Build → Verify → Prove → Connect → Review → Govern → Stay Connected.",
      },
    ],
  },
  { label: "Why SkillPassport", href: "/#platform" },
  { label: "AI", href: "/ai/" },
  { label: "Trust & Security", href: "/trust/" },
  { label: "Contact", href: "/contact/" },
];

export const footerSolutions: NavLink[] = [
  { label: "For Candidates", href: "/candidates/" },
  { label: "For Employers", href: "/employers/" },
  { label: "For Verifiers", href: "/verifiers/" },
  { label: "For Reviewers", href: "/reviewers/" },
  { label: "Enterprises & Admins", href: "/enterprises/" },
];

export const footerPlatform: NavLink[] = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Create Your Passport", href: "/create-passport/" },
  { label: "AI", href: "/ai/" },
  { label: "Trust & Security", href: "/trust/" },
  { label: "Contact", href: "/contact/" },
];

/**
 * On-site CTAs only — labels match destinations.
 * Static Sign in / Sign up demos exist; they do not create real sessions or accounts.
 * Sign in → /sign-in/ (local form demo)
 * Sign up / Create Your Passport → /create-passport/
 * Contact → /contact/ (inquiry demo; kept in primary nav, not duplicated as CTA)
 */
export const appLinks = {
  signIn: "/sign-in/",
  register: "/create-passport/",
  supportEmail: "mailto:support@skillpassport.com",
} as const;
