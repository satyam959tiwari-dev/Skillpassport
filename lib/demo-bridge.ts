/**
 * Lightweight cross-page demo bridge (sessionStorage).
 * Keeps marketing demos feeling connected without a real backend.
 */

export const DEMO_BRIDGE_KEY = "sp-demo-bridge-v1";

export type DemoDocStatus = "uploaded" | "in_review" | "verified" | "needs_info";

export type GuestReviewState = "invited" | "submitted" | "pending_admin" | "visible" | "rejected";

export type DemoApproval = {
  id: string;
  type: string;
  state: "Pending" | "Approved" | "Rejected";
  source: string;
};

export type DemoTicket = {
  id: string;
  from: string;
  subject: string;
  status: "Open" | "In progress" | "Closed";
};

export type DemoGuestReview = {
  id: string;
  guest: string;
  skill: string;
  state: GuestReviewState;
};

export type DemoMediaSubmission = {
  id: string;
  title: string;
  kind: "video" | "pdf" | "link";
  state: "Submitted" | "In review" | "Completed";
};

export type DemoBridgeState = {
  candidateName: string;
  candidateRole: string;
  skills: string[];
  summary: string;
  fromPassport: boolean;
  applications: Array<{
    id: string;
    jobId: string;
    jobTitle: string;
    company: string;
    stage: string;
  }>;
  docs: Array<{ id: string; label: string; status: DemoDocStatus }>;
  guestReviews: DemoGuestReview[];
  tickets: DemoTicket[];
  mediaSubmissions: DemoMediaSubmission[];
  approvals: DemoApproval[];
  audit: string[];
  approvalsPending: number;
  activity: string[];
};

const defaultState = (): DemoBridgeState => ({
  candidateName: "Aarav Sharma",
  candidateRole: "Frontend engineer",
  skills: ["React", "TypeScript", "Accessibility"],
  summary: "Building accessible product interfaces with React and TypeScript.",
  fromPassport: false,
  applications: [],
  docs: [
    { id: "doc-1", label: "Degree certificate", status: "in_review" },
    { id: "doc-2", label: "Frontend certificate", status: "verified" },
    { id: "doc-3", label: "Portfolio PDF", status: "uploaded" },
  ],
  guestReviews: [
    {
      id: "guest-1",
      guest: "Priya N.",
      skill: "Accessibility",
      state: "visible",
    },
    {
      id: "guest-2",
      guest: "Dev peer",
      skill: "React",
      state: "pending_admin",
    },
  ],
  tickets: [],
  mediaSubmissions: [],
  approvals: [
    {
      id: "ap-guest-2",
      type: "Guest review endorsement",
      state: "Pending",
      source: "guest-2",
    },
    {
      id: "ap-media",
      type: "Media approval request",
      state: "Pending",
      source: "seed",
    },
  ],
  audit: ["Demo bridge ready — local session only."],
  approvalsPending: 2,
  activity: [],
});

function canUseStorage() {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

function withPending(state: DemoBridgeState): DemoBridgeState {
  const approvalsPending = state.approvals.filter((a) => a.state === "Pending").length;
  return { ...state, approvalsPending };
}

export function readDemoBridge(): DemoBridgeState {
  if (!canUseStorage()) return defaultState();
  try {
    const raw = sessionStorage.getItem(DEMO_BRIDGE_KEY);
    if (!raw) return defaultState();
    return withPending({ ...defaultState(), ...JSON.parse(raw) } as DemoBridgeState);
  } catch {
    return defaultState();
  }
}

export function writeDemoBridge(patch: Partial<DemoBridgeState>) {
  if (!canUseStorage()) return defaultState();
  const next = withPending({ ...readDemoBridge(), ...patch });
  sessionStorage.setItem(DEMO_BRIDGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("sp-demo-bridge"));
  return next;
}

export function pushBridgeActivity(line: string) {
  const cur = readDemoBridge();
  const activity = [line, ...cur.activity].slice(0, 12);
  const audit = [line, ...cur.audit].slice(0, 20);
  return writeDemoBridge({ activity, audit });
}

export function seedFromPassport(input: {
  name: string;
  role: string;
  skills: string[];
  summary: string;
}) {
  return writeDemoBridge({
    candidateName: input.name || "Aarav Sharma",
    candidateRole: input.role || "Frontend engineer",
    skills: input.skills.length ? input.skills : ["React", "TypeScript"],
    summary: input.summary || defaultState().summary,
    fromPassport: true,
  });
}

export function recordApplication(job: {
  jobId: string;
  jobTitle: string;
  company: string;
}) {
  const cur = readDemoBridge();
  if (cur.applications.some((a) => a.jobId === job.jobId)) return cur;
  const applications = [
    {
      id: `app-${job.jobId}`,
      jobId: job.jobId,
      jobTitle: job.jobTitle,
      company: job.company,
      stage: "Applied",
    },
    ...cur.applications,
  ];
  return writeDemoBridge({
    applications,
    activity: [
      `Applied to ${job.jobTitle} at ${job.company}`,
      ...cur.activity,
    ].slice(0, 12),
    audit: [
      `Application created: ${job.jobTitle}`,
      ...cur.audit,
    ].slice(0, 20),
  });
}

export function setApplicationStage(jobId: string, stage: string) {
  const cur = readDemoBridge();
  const applications = cur.applications.map((a) =>
    a.jobId === jobId ? { ...a, stage } : a,
  );
  return writeDemoBridge({
    applications,
    activity: [`Application stage → ${stage}`, ...cur.activity].slice(0, 12),
  });
}

export function syncDocStatus(id: string, status: DemoDocStatus, label?: string) {
  const cur = readDemoBridge();
  const docs = cur.docs.map((d) => (d.id === id ? { ...d, status } : d));
  const name = label ?? docs.find((d) => d.id === id)?.label ?? id;
  return writeDemoBridge({
    docs,
    activity: [`Document “${name}” → ${status}`, ...cur.activity].slice(0, 12),
    audit: [`Doc ${name}: ${status}`, ...cur.audit].slice(0, 20),
  });
}

export function inviteGuestReview(input: { guest: string; skill: string }) {
  const cur = readDemoBridge();
  const id = `guest-${Date.now()}`;
  const guestReviews: DemoGuestReview[] = [
    { id, guest: input.guest, skill: input.skill, state: "invited" },
    ...cur.guestReviews,
  ];
  return writeDemoBridge({
    guestReviews,
    activity: [`Guest invite sent to ${input.guest}`, ...cur.activity].slice(0, 12),
  });
}

export function submitGuestReview(id: string) {
  const cur = readDemoBridge();
  const guestReviews = cur.guestReviews.map((g) =>
    g.id === id ? { ...g, state: "pending_admin" as const } : g,
  );
  const target = cur.guestReviews.find((g) => g.id === id);
  const approvalId = `ap-${id}`;
  const approvals = cur.approvals.some((a) => a.id === approvalId)
    ? cur.approvals
    : [
        {
          id: approvalId,
          type: `Guest review · ${target?.skill ?? "skill"}`,
          state: "Pending" as const,
          source: id,
        },
        ...cur.approvals,
      ];
  return writeDemoBridge({
    guestReviews,
    approvals,
    activity: [`Guest review submitted — awaiting admin`, ...cur.activity].slice(0, 12),
  });
}

export function resolveApproval(id: string, state: "Approved" | "Rejected") {
  const cur = readDemoBridge();
  const approvals = cur.approvals.map((a) => (a.id === id ? { ...a, state } : a));
  const approval = cur.approvals.find((a) => a.id === id);
  let guestReviews = cur.guestReviews;
  if (approval?.source.startsWith("guest")) {
    guestReviews = cur.guestReviews.map((g) =>
      g.id === approval.source
        ? { ...g, state: state === "Approved" ? "visible" : "rejected" }
        : g,
    );
  }
  return writeDemoBridge({
    approvals,
    guestReviews,
    activity: [`Approval ${state}: ${approval?.type ?? id}`, ...cur.activity].slice(0, 12),
    audit: [`Approval ${id} → ${state}`, ...cur.audit].slice(0, 20),
  });
}

export function raiseTicket(input: { from: string; subject: string }) {
  const cur = readDemoBridge();
  const id = `tkt-${Date.now()}`;
  const tickets: DemoTicket[] = [
    { id, from: input.from, subject: input.subject, status: "Open" },
    ...cur.tickets,
  ];
  return writeDemoBridge({
    tickets,
    activity: [`Ticket opened: ${input.subject}`, ...cur.activity].slice(0, 12),
    audit: [`Ticket ${id} opened`, ...cur.audit].slice(0, 20),
  });
}

export function submitMedia(input: { title: string; kind: "video" | "pdf" | "link" }) {
  const cur = readDemoBridge();
  const id = `media-${Date.now()}`;
  const mediaSubmissions: DemoMediaSubmission[] = [
    { id, title: input.title, kind: input.kind, state: "Submitted" },
    ...cur.mediaSubmissions,
  ];
  const approvals: DemoApproval[] = [
    {
      id: `ap-${id}`,
      type: `Media approval · ${input.title}`,
      state: "Pending",
      source: id,
    },
    ...cur.approvals,
  ];
  return writeDemoBridge({
    mediaSubmissions,
    approvals,
    activity: [`Media submitted: ${input.title}`, ...cur.activity].slice(0, 12),
  });
}

export function queueReviewApproval(input: { title: string; source: string }) {
  const cur = readDemoBridge();
  const id = `ap-rev-${Date.now()}`;
  const approvals: DemoApproval[] = [
    {
      id,
      type: `Review result · ${input.title}`,
      state: "Pending",
      source: input.source,
    },
    ...cur.approvals,
  ];
  return writeDemoBridge({
    approvals,
    activity: [`Review queued for admin approval`, ...cur.activity].slice(0, 12),
  });
}
