export const reviewerRubricCriteria = [
  { id: "accuracy", label: "Technical accuracy", weight: 40, max: 5 },
  { id: "solving", label: "Problem solving", weight: 35, max: 5 },
  { id: "comms", label: "Communication", weight: 25, max: 5 },
] as const;

/** Performance level labels for a 0–5 rubric score. */
export const reviewerPerformanceLevels = [
  { score: 0, label: "Not evidenced" },
  { score: 1, label: "Emerging" },
  { score: 2, label: "Emerging" },
  { score: 3, label: "Proficient" },
  { score: 4, label: "Proficient" },
  { score: 5, label: "Strong" },
] as const;

export function reviewerLevelLabel(score: number): string {
  const clamped = Math.max(0, Math.min(5, Math.round(score)));
  return reviewerPerformanceLevels[clamped].label;
}

export const reviewerChecklistItems = [
  { id: "c1", label: "Evidence matches assessment instructions", mandatory: true },
  { id: "c2", label: "Required supporting documents attached", mandatory: true },
  { id: "c3", label: "Submission meets format requirements", mandatory: false },
  { id: "c4", label: "Reviewer comments completed", mandatory: true },
] as const;

export type ReviewerQueueType = "Assessment" | "Media";
export type ReviewerQueueState = "Queued" | "In review" | "Completed";

export type ReviewerQueueItem = {
  id: string;
  title: string;
  type: ReviewerQueueType;
  state: ReviewerQueueState;
  /** True once grading was submitted and an admin still has to approve it. */
  pendingAdmin?: boolean;
  /** Short grading summary recorded when the review was submitted. */
  result?: string;
};

export const reviewerQueueSamples: ReviewerQueueItem[] = [
  { id: "q1", title: "Frontend practical — Meera I.", type: "Assessment", state: "Queued" },
  { id: "q2", title: "Portfolio walkthrough — Rohan S.", type: "Media", state: "In review" },
  {
    id: "q3",
    title: "Self-review package — Priya K.",
    type: "Assessment",
    state: "Completed",
    result: "Rubric 72%",
  },
  { id: "q4", title: "Project demo recording — Ananya D.", type: "Media", state: "Queued" },
];

export type ReviewerImportSample = {
  id: string;
  label: string;
  classification: "Rubric" | "Checklist";
  draft: string;
  /** Default builder sections for this sample type. */
  sections: string[];
};

export const reviewerImportSamples: ReviewerImportSample[] = [
  {
    id: "pdf",
    label: "Sample PDF rubric",
    classification: "Rubric",
    draft: "Draft rubric: Accuracy / Problem solving / Communication with sample weights.",
    sections: ["Criteria", "Performance levels", "Weights", "Summary"],
  },
  {
    id: "docx",
    label: "Sample Word checklist",
    classification: "Checklist",
    draft: "Draft checklist: evidence attached, format OK, comments required.",
    sections: ["Required items", "Optional items", "Evidence notes", "Sign-off"],
  },
  {
    id: "md",
    label: "Sample Markdown form",
    classification: "Rubric",
    draft: "Draft rubric generated from Markdown sections.",
    sections: ["Criteria", "Performance levels", "Evidence notes", "Summary"],
  },
];
