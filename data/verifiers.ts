export type VerifierCaseStatus =
  | "awaiting_admin"
  | "assigned"
  | "completed"
  | "on_hold"
  | "escalated";

export type VerifierOutcome = "verified" | "rejected";

export const verifierOutcomeLabel: Record<VerifierOutcome, string> = {
  verified: "Verified",
  rejected: "Rejected",
};

export type VerifierCase = {
  id: string;
  title: string;
  candidate: string;
  status: VerifierCaseStatus;
  area: string;
  note: string;
  /** Optional link to a candidate document id in the demo bridge. */
  docId?: string;
  /** Optional due label, e.g. "Due Fri" or "Overdue by 2 days". */
  dueLabel?: string;
  outcome: VerifierOutcome | null;
  outcomeReason: string;
};

export const verifierCaseStatusLabel: Record<VerifierCaseStatus, string> = {
  awaiting_admin: "Awaiting Admin",
  assigned: "Assigned",
  completed: "Completed",
  on_hold: "On Hold",
  escalated: "Escalated",
};

export const verifierBoardFilters = [
  { id: "all", label: "All" },
  { id: "awaiting_admin", label: "Awaiting Admin" },
  { id: "assigned", label: "Assigned" },
  { id: "completed", label: "Completed" },
  { id: "on_hold", label: "On Hold" },
  { id: "escalated", label: "Escalated" },
] as const;

export const verifierCases: VerifierCase[] = [
  {
    id: "V-104",
    title: "Academic Credential",
    candidate: "Candidate A",
    status: "assigned",
    area: "Verification Board",
    note: "Document pack attached.",
    docId: "doc-1",
    outcome: null,
    outcomeReason: "",
  },
  {
    id: "V-105",
    title: "Professional Certificate",
    candidate: "Candidate B",
    status: "on_hold",
    area: "All Verifications",
    note: "Issuer confirmation pending.",
    docId: "doc-2",
    outcome: null,
    outcomeReason: "",
    dueLabel: "Overdue (demo)",
  },
  {
    id: "V-106",
    title: "Experience Document",
    candidate: "Candidate C",
    status: "completed",
    area: "All Verifications",
    note: "Outcome recorded.",
    docId: "doc-3",
    outcome: "verified",
    outcomeReason: "",
  },
  {
    id: "V-107",
    title: "Academic Document",
    candidate: "Candidate D",
    status: "escalated",
    area: "All Verifications",
    note: "Needs additional review.",
    outcome: null,
    outcomeReason: "",
  },
  {
    id: "V-108",
    title: "Apply Verification request",
    candidate: "Candidate E",
    status: "awaiting_admin",
    area: "Apply Verification",
    note: "Administrative coordination area.",
    outcome: null,
    outcomeReason: "",
  },
  {
    id: "V-109",
    title: "License pack review",
    candidate: "Candidate F",
    status: "awaiting_admin",
    area: "Awaiting Admin",
    note: "Pending administrative coordination.",
    outcome: null,
    outcomeReason: "",
  },
];

/** Sample copy only. Volume is derived from the live case list in the board. */
export const verifierReportSamples = {
  accuracy: "Illustrative only",
  sla: "Sample target: first response within 2 working days",
} as const;
