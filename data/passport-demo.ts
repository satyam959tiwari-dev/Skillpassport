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
    hint: "Add a document first — status starts after a simulated request.",
  },
  in_review: {
    label: "In review",
    hint: "Entered a simulated verification queue. Not automatically verified.",
  },
  verified: {
    label: "Verified",
    hint: "Illustrative outcome for this demo — not a real credential check.",
  },
  needs_info: {
    label: "Needs info",
    hint: "Simulated gate: more documentation would be requested in product.",
  },
};

export const passportDemoSteps = [
  {
    id: "profile",
    title: "Your profile",
    description: "Enter a few details — this is a static demo, nothing is submitted to a server.",
  },
  {
    id: "skills",
    title: "Skills & credentials",
    description: "Choose skills and illustrative supporting documents.",
  },
  {
    id: "verify",
    title: "Verification",
    description: "Track status — uploading does not mean verified.",
  },
  {
    id: "prove",
    title: "Prove skills",
    description: "Assessments, self-reviews, and expert rubric evidence.",
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
    title: "Prove what you can do",
    body: "Assessments, self-reviews, and expert rubrics back every claim.",
  },
  {
    id: "match",
    title: "Share and find opportunities",
    body: "Control visibility, then explore jobs with evidence employers can inspect.",
  },
] as const;
