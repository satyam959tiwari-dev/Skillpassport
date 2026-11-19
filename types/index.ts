export type AudienceId =
  | "candidates"
  | "employers"
  | "verifiers"
  | "reviewers"
  | "enterprises";

export interface NavLink {
  label: string;
  href: string;
  description?: string;
}

export interface NavGroup {
  label: string;
  href?: string;
  children?: NavLink[];
}

export interface CtaLink {
  label: string;
  href: string;
}

export interface AudienceSolution {
  id: AudienceId;
  title: string;
  eyebrow: string;
  /** Plain headline; use accentWord for logo-blue highlight */
  headline: string;
  /** Word/phrase inside headline rendered in logo gradient */
  accentWord: string;
  summary: string;
  href: string;
  benefits: string[];
  features: string[];
  /** On-page / cross-page CTAs that match their labels */
  primaryCta: CtaLink;
  secondaryCta: CtaLink;
  footerCta: CtaLink;
}

export interface WorkflowStage {
  id: string;
  label: string;
  title: string;
  description: string;
  outcomes: string[];
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  audience?: AudienceId | "all";
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface AiDemoExample {
  id: string;
  title: string;
  description: string;
  inputLabel: string;
  input: string;
  outputLabel: string;
  output: string;
  note: string;
}

export interface TrustPrinciple {
  id: string;
  title: string;
  description: string;
}

export interface ContactTopic {
  id: string;
  label: string;
}

export interface PageMeta {
  title: string;
  description: string;
  path: string;
}
