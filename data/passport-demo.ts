export const passportSkillOptions = [
  { id: "typescript", label: "TypeScript", level: 90 },
  { id: "react", label: "React", level: 88 },
  { id: "nodejs", label: "Node.js", level: 82 },
  { id: "sql", label: "SQL", level: 86 },
  { id: "system", label: "System design", level: 74 },
  { id: "a11y", label: "Accessibility", level: 78 },
  { id: "comms", label: "Product communication", level: 80 },
  { id: "mentor", label: "Mentoring", level: 70 },
] as const;

export const passportCredentialOptions = [
  {
    id: "degree",
    label: "Computer Science degree",
    kind: "Education",
  },
  {
    id: "cert",
    label: "Professional certificate",
    kind: "Certificate",
  },
  {
    id: "license",
    label: "Industry license / credential",
    kind: "Credential",
  },
] as const;

export const passportAssessmentOptions = [
  {
    id: "practical",
    label: "Frontend practical assessment",
    hint: "Task + rubric evidence",
  },
  {
    id: "self",
    label: "Structured self-review",
    hint: "Checklist against role skills",
  },
  {
    id: "expert",
    label: "Expert rubric review",
    hint: "Human reviewer judgment",
  },
] as const;

export type VerificationStatus = "not_submitted" | "in_review" | "verified" | "needs_info";

export const verificationStatusCopy: Record<
  VerificationStatus,
  { label: string; hint: string }
> = {
  not_submitted: {
    label: "Not submitted",
    hint: "Add a document first — status starts once it is submitted.",
  },
  in_review: {
    label: "In review",
    hint: "In the verification queue. Not verified until a verifier checks it.",
  },
  verified: {
    label: "Verified",
    hint: "Checked by a verifier — shown as verified on the passport.",
  },
  needs_info: {
    label: "Needs info",
    hint: "The verifier needs more documentation before deciding.",
  },
};

export const passportDemoSteps = [
  {
    id: "profile",
    title: "Your profile",
    description: "Start with a few details about you.",
  },
  {
    id: "skills",
    title: "Skills & credentials",
    description: "Choose your skills and the documents that support them.",
  },
  {
    id: "verify",
    title: "Verification",
    description: "Track status — uploading does not mean verified.",
  },
  {
    id: "prove",
    title: "Assessments",
    description: "Take assessments and self-reviews, or request an expert review.",
  },
  {
    id: "share",
    title: "Share & discover",
    description: "Visibility controls and opportunity-ready passport.",
  },
] as const;

export const passportFeatureSlides = [
  {
    id: "passport",
    title: "Build your Digital Skill Passport",
    body: "One unified profile for verified skills, credentials, and proof.",
  },
  {
    id: "credentials",
    title: "Store verified credentials",
    body: "Documents enter a tracked workflow — status is visible, not automatic.",
  },
  {
    id: "assess",
    title: "Back your skills with assessments",
    body: "Assessments, self-reviews, and expert reviews back up your skill claims.",
  },
  {
    id: "match",
    title: "Share and find opportunities",
    body: "Control visibility, then explore jobs with evidence employers can inspect.",
  },
] as const;
