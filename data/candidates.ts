export const candidateJourneySteps = [
  {
    id: "profile",
    title: "Complete your profile",
    body: "Personal details, skills, experience, professional summary, photo, and visibility.",
  },
  {
    id: "credentials",
    title: "Upload documents",
    body: "Attach certificates and other documents. Each one gets a tracked status — uploading alone never marks it verified.",
  },
  {
    id: "verify",
    title: "Get verified",
    body: "Verifier companies check your documents in verification queues, with Super Admin oversight.",
  },
  {
    id: "prove",
    title: "Take assessments",
    body: "My Assessments, Add Media, Self-Reviews, and Expert Reviews — graded by reviewers on rubrics or checklists.",
  },
  {
    id: "opportunities",
    title: "Apply and share",
    body: "Find Jobs, Saved Jobs, Applications, optional public sharing, and Refer & Earn.",
  },
] as const;

export const candidateDocumentSamples = [
  {
    id: "doc-degree",
    label: "Computer Science degree",
    kind: "Education",
    status: "in_review" as const,
  },
  {
    id: "doc-cert",
    label: "Frontend professional certificate",
    kind: "Certificate",
    status: "verified" as const,
  },
  {
    id: "doc-license",
    label: "Industry credential",
    kind: "Credential",
    status: "needs_info" as const,
  },
];

/** Extra documents the "Add sample document" button cycles through. */
export const candidateSampleDocumentPool = [
  { id: "doc-sample-portfolio", label: "Portfolio PDF", kind: "Portfolio" },
  { id: "doc-sample-reference", label: "Employer reference letter", kind: "Reference" },
  { id: "doc-sample-training", label: "Accessibility training certificate", kind: "Certificate" },
] as const;

export const candidateAssessmentCatalog = [
  {
    id: "assess-frontend",
    title: "Frontend practical assessment",
    focus: "React · TypeScript · Accessibility",
    kind: "assessment" as const,
  },
  {
    id: "assess-api",
    title: "API design scenario",
    focus: "REST · Idempotency · Error handling",
    kind: "assessment" as const,
  },
  {
    id: "media-portfolio",
    title: "Portfolio walkthrough (media)",
    focus: "Video · Screen capture · Narrative",
    kind: "media" as const,
  },
  {
    id: "self-react",
    title: "React self-review checklist",
    focus: "Self-evaluation against role skills",
    kind: "self" as const,
  },
  {
    id: "expert-system",
    title: "System design expert review",
    focus: "Rubric-weighted expert scoring",
    kind: "expert" as const,
  },
];

export const candidateJobSamples = [
  {
    id: "job-1",
    title: "Frontend Engineer",
    company: "Northline Labs",
    location: "Bengaluru · Hybrid",
    skills: ["React", "TypeScript", "Accessibility"],
  },
  {
    id: "job-2",
    title: "Full-stack Engineer",
    company: "Harbour Systems",
    location: "Remote · India",
    skills: ["Node.js", "SQL", "React"],
  },
  {
    id: "job-3",
    title: "Product Engineer",
    company: "Clearpath",
    location: "Pune · On-site",
    skills: ["TypeScript", "System design", "Communication"],
  },
];

export const candidateAiSummaryDraft =
  "Frontend-focused engineer with experience building responsive interfaces in React and TypeScript, with attention to accessibility and collaborative delivery. Credentials and assessment evidence can be attached so employers inspect proof—not only claims. Edit this draft before saving.";

export const candidateAiAssessmentSuggestions = [
  {
    id: "sug-a11y",
    title: "Accessibility practical",
    reason: "Aligned to profile skill: Accessibility",
  },
  {
    id: "sug-react",
    title: "React component patterns",
    reason: "Aligned to profile skill: React",
  },
  {
    id: "sug-job",
    title: "Role-prep: Frontend Engineer screening",
    reason: "Aligned to your target job",
  },
] as const;

export const candidateGuestReviews = [
  {
    id: "guest-1",
    from: "Peer endorsement · Maya K.",
    skill: "Mentoring",
    status: "visible" as const,
    note: "Visible to candidate.",
  },
  {
    id: "guest-2",
    from: "Guest invite · Dev circle",
    skill: "System design",
    status: "pending_approval" as const,
    note: "Awaiting applicable admin approval before candidate visibility.",
  },
];

export type CandidateDocStatus = "not_submitted" | "in_review" | "verified" | "needs_info";

export const candidateDocStatusLabel: Record<CandidateDocStatus, string> = {
  not_submitted: "Not submitted",
  in_review: "In review",
  verified: "Verified",
  needs_info: "Needs info",
};

/** Three-item self-review checklist shown once a self-review is started. */
export const candidateSelfReviewChecklist = [
  "I can explain the core concepts without notes",
  "I have shipped work that demonstrates this skill",
  "I can name one area I still want to improve",
] as const;

/** Referral stats shown in the Refer & Earn panel. */
export const candidateReferStats = {
  invites: 3,
  joined: 1,
  earned: "₹0",
} as const;
