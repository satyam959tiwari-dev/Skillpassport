"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ChangeEvent,
} from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  DemoJourneyStrip,
  type DemoJourneyStep,
} from "@/components/interactive/DemoJourneyStrip";
import {
  employerAiQueries,
  employerPipelineStages,
  employerSkillGaps,
  employerTalentSamples,
  employerTeamSeats,
  type EmployerPipelineStage,
} from "@/data/employers";
import { useDemoActivity } from "@/hooks/useDemoActivity";
import { readDemoBridge, setApplicationStage, type DemoBridgeState } from "@/lib/demo-bridge";
import { cx } from "@/lib/utils";

const tabs = [
  { id: "dashboard", label: "Dashboard" },
  { id: "company", label: "Company & Profile" },
  { id: "jobs", label: "Jobs" },
  { id: "talent", label: "Talent Search" },
  { id: "pipeline", label: "Applicants" },
  { id: "team", label: "Team & Reviewers" },
  { id: "reporting", label: "Reporting & AI" },
] as const;

type TabId = (typeof tabs)[number]["id"];

/** Suggested modules for a hiring loop — order is optional, not a state machine. */
const modules: ReadonlyArray<DemoJourneyStep<TabId>> = [
  {
    id: "company",
    label: "Company",
    doNext: "Set company profile and hiring assessments",
  },
  {
    id: "jobs",
    label: "Jobs",
    doNext: "Add or edit a job and publish — state stays when you leave the tab",
  },
  {
    id: "talent",
    label: "Talent",
    doNext: "Filter talent by skill and shortlist people to Applicants",
  },
  {
    id: "pipeline",
    label: "Applicants",
    doNext: "Move applicants through stages and run interview actions per applicant",
  },
  {
    id: "team",
    label: "Team",
    doNext: "Invite seats and work the company reviewer queue",
  },
  {
    id: "reporting",
    label: "Reporting",
    doNext: "Review skill gaps and run a Good Practice AI Query",
  },
];

type JobDraft = {
  id: string;
  title: string;
  /** Up to two screening questions. */
  screening: string[];
  skills: string;
  location: string;
  published: boolean;
};

type Applicant = {
  id: string;
  name: string;
  jobId: string;
  stage: EmployerPipelineStage;
  /** Per-applicant interview note (schedule / reschedule / cancel / evaluate). */
  note?: string;
  source?: "bridge" | "shortlist";
  /** Candidate-demo job id used when syncing the stage back to the demo bridge. */
  bridgeJobId?: string;
};

type TalentRow = {
  id: string;
  name: string;
  role: string;
  skills: readonly string[];
  credential: string;
  evidence: string;
  live?: boolean;
};

type HiringAssessment = {
  id: string;
  title: string;
  jobId: string;
  state: string;
};

type QueueItem = {
  id: string;
  assessmentId: string;
  applicantId: string;
  state: string;
};

type MyReview = {
  id: string;
  /** Static title for sample history rows. */
  title?: string;
  jobId?: string;
  /** Derived title from the reviewer queue. */
  queueId?: string;
  outcome: string;
};

type InterviewAction = "schedule" | "reschedule" | "cancel" | "evaluate";

const interviewActions: InterviewAction[] = ["schedule", "reschedule", "cancel", "evaluate"];

const QUEUED = "Queued";
const ON_HOLD = "On hold (draft assessment)";
const IN_REVIEW = "In review";
const REVIEWED = "Reviewed";
const CLOSED = "Closed (applicant advanced)";
const IN_PROGRESS = "In progress";
const COMPLETED = "Completed";

const initialJobs: JobDraft[] = [
  {
    id: "j1",
    title: "Frontend Engineer",
    screening: ["Describe a recent accessibility fix.", "How do you test keyboard navigation?"],
    skills: "React, TypeScript, Accessibility",
    location: "Bengaluru / Hybrid",
    published: false,
  },
  {
    id: "j2",
    title: "Full-stack Engineer",
    screening: ["Walk through an API you designed.", ""],
    skills: "Node.js, SQL, React",
    location: "Remote (India)",
    published: true,
  },
];

const initialApplicants: Applicant[] = [
  { id: "a1", name: "Meera Iyer", jobId: "j1", stage: "Applied" },
  { id: "a2", name: "Rohan Shah", jobId: "j2", stage: "Assessment" },
  { id: "a3", name: "Priya Kapoor", jobId: "j1", stage: "Interview" },
];

const initialAssessments: HiringAssessment[] = [
  {
    id: "ha1",
    title: "Frontend practical — accessibility checklist",
    jobId: "j1",
    state: "Ready",
  },
  {
    id: "ha2",
    title: "API design scenario",
    jobId: "j2",
    state: "Draft",
  },
];

const initialQueue: QueueItem[] = [
  { id: "rq2", assessmentId: "ha2", applicantId: "a2", state: IN_REVIEW },
];

const initialMyReviews: MyReview[] = [
  { id: "mr1", title: "Communication review — Priya K.", jobId: "j1", outcome: COMPLETED },
  { id: "mr2", title: "Frontend practical", outcome: COMPLETED },
];

const BRIDGE_EVENT = "sp-demo-bridge";

function subscribeBridge(onChange: () => void) {
  window.addEventListener(BRIDGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(BRIDGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getBridgeSnapshot() {
  const bridge = readDemoBridge();
  return JSON.stringify({
    name: bridge.candidateName,
    role: bridge.candidateRole,
    skills: bridge.skills,
    verifiedDocs: bridge.docs.filter((d) => d.status === "verified").length,
    totalDocs: bridge.docs.length,
    applications: bridge.applications,
  });
}

function getBridgeServerSnapshot() {
  return JSON.stringify({
    name: "Aarav Sharma",
    role: "Frontend engineer",
    skills: ["React", "TypeScript", "Accessibility"],
    verifiedDocs: 1,
    totalDocs: 3,
    applications: [],
  });
}

const BRIDGE_TALENT_ID = "bridge-candidate";

const inputCls =
  "mt-2 w-full rounded-xl border border-[var(--color-rule)] bg-field px-4 py-3 text-white outline-none focus:border-[var(--color-sky)]";

const isReady = (a: HiringAssessment) => a.state.startsWith("Ready");

function displayJobTitle(title: string) {
  return title.trim() || "Untitled job";
}

function SeedBadge({ short = false }: { short?: boolean }) {
  return (
    <span
      className="inline-block rounded-full border border-[var(--color-rule)] bg-white/5 px-2.5 py-0.5 text-[11px] text-[var(--color-sky)]"
      title="Existing history — publishing does not create applicants"
    >
      {short ? "Existing history" : "Existing history — publishing does not create applicants"}
    </span>
  );
}

export function EmployerExperience() {
  const [tab, setTab] = useState<TabId>("dashboard");
  const [skillFilter, setSkillFilter] = useState("All");
  const [talentQuery, setTalentQuery] = useState("");
  const [newAssessmentTitle, setNewAssessmentTitle] = useState("");
  const [interviewWhen, setInterviewWhen] = useState("");
  const [jobs, setJobs] = useState<JobDraft[]>(initialJobs.map((j) => ({ ...j })));
  const [activeJobId, setActiveJobId] = useState(initialJobs[0].id);
  const [applicantFilter, setApplicantFilter] = useState<string | "all">("all");
  const [companyName, setCompanyName] = useState("Lumen Hire");
  const [recruiterName, setRecruiterName] = useState("Anika Rao");
  const [hiringAssessments, setHiringAssessments] = useState<HiringAssessment[]>(
    initialAssessments.map((a) => ({ ...a })),
  );
  const [applicants, setApplicants] = useState<Applicant[]>(
    initialApplicants.map((a) => ({ ...a })),
  );
  const [interviewApplicantId, setInterviewApplicantId] = useState<string | null>(null);
  const [seats, setSeats] = useState<
    Array<{ id: string; name: string; role: string; active: boolean; invited?: boolean }>
  >(employerTeamSeats.map((s) => ({ ...s })));
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Recruiter");
  const [inviteMsg, setInviteMsg] = useState<string | null>(null);
  const [aiQueryId, setAiQueryId] = useState<(typeof employerAiQueries)[number]["id"]>(
    employerAiQueries[0].id,
  );
  const [aiRanId, setAiRanId] = useState<(typeof employerAiQueries)[number]["id"] | null>(null);
  const [reviewerQueue, setReviewerQueue] = useState<QueueItem[]>(
    initialQueue.map((q) => ({ ...q })),
  );
  const [myReviews, setMyReviews] = useState<MyReview[]>(initialMyReviews.map((m) => ({ ...m })));
  const [queueFocus, setQueueFocus] = useState<{
    assessmentId?: string;
    applicantId?: string;
  } | null>(null);

  const { justHappened, activity, act } = useDemoActivity(null);
  const focusValue = useRef("");

  const bridgeRaw = useSyncExternalStore(
    subscribeBridge,
    getBridgeSnapshot,
    getBridgeServerSnapshot,
  );
  const bridge = useMemo(
    () =>
      JSON.parse(bridgeRaw) as {
        name: string;
        role: string;
        skills: string[];
        verifiedDocs: number;
        totalDocs: number;
        applications: DemoBridgeState["applications"];
      },
    [bridgeRaw],
  );

  // Merge candidate-demo applications (Aarav) as extra applicant rows.
  useEffect(() => {
    if (tab !== "pipeline" && tab !== "dashboard") return;
    if (!bridge.applications.length) return;
    setApplicants((prev) => {
      const additions: Applicant[] = [];
      for (const app of bridge.applications) {
        const id = `bridge-${app.id}`;
        if (prev.some((a) => a.id === id)) continue;
        const wanted = app.jobTitle.trim().toLowerCase();
        const match = jobs.find((j) => j.title.trim().toLowerCase() === wanted);
        const stage = (employerPipelineStages as readonly string[]).includes(app.stage)
          ? (app.stage as EmployerPipelineStage)
          : "Applied";
        additions.push({
          id,
          name: bridge.name,
          jobId: match?.id ?? "j1",
          stage,
          source: "bridge",
          bridgeJobId: app.jobId,
        });
      }
      return additions.length ? [...prev, ...additions] : prev;
    });
  }, [tab, bridge, jobs]);

  const activeJob = jobs.find((j) => j.id === activeJobId) ?? jobs[0];
  const jobTitle = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    return job ? displayJobTitle(job.title) : "Unknown job";
  };
  const jobHasSeedHistory = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    return !!job && !job.published && applicants.some((a) => a.jobId === jobId);
  };

  const allTalent = useMemo<TalentRow[]>(() => {
    const live: TalentRow = {
      id: BRIDGE_TALENT_ID,
      name: bridge.name,
      role: bridge.role,
      skills: bridge.skills,
      credential: `${bridge.verifiedDocs} of ${bridge.totalDocs} documents verified (live)`,
      evidence: "From the candidate workspace — document status updates as verifiers act",
      live: true,
    };
    return [live, ...employerTalentSamples.map((t) => ({ ...t }))];
  }, [bridge]);

  const skills = useMemo(() => {
    const set = new Set<string>(["All"]);
    allTalent.forEach((t) => t.skills.forEach((s) => set.add(s)));
    return Array.from(set);
  }, [allTalent]);

  const talent = allTalent.filter((t) => {
    if (skillFilter !== "All" && !t.skills.includes(skillFilter)) return false;
    const q = talentQuery.trim().toLowerCase();
    if (!q) return true;
    return [t.name, t.role, t.credential, ...t.skills].join(" ").toLowerCase().includes(q);
  });

  const aiSelected = employerAiQueries.find((q) => q.id === aiQueryId) ?? employerAiQueries[0];
  const aiRan = employerAiQueries.find((q) => q.id === aiRanId) ?? null;

  const applicantsForActiveJob = applicants.filter((a) => a.jobId === activeJobId);
  const visibleApplicants =
    applicantFilter === "all"
      ? applicants
      : applicants.filter((a) => a.jobId === applicantFilter);

  const selectedApplicant =
    visibleApplicants.find((a) => a.id === interviewApplicantId) ?? visibleApplicants[0] ?? null;

  const queuedCount = reviewerQueue.filter((q) => q.state === QUEUED).length;

  // ---- Reviewer queue helpers (labels are derived from live job / applicant data) ----

  const queueTitle = (q: QueueItem) => {
    const assessment = hiringAssessments.find((a) => a.id === q.assessmentId);
    const person = applicants.find((a) => a.id === q.applicantId)?.name ?? "Applicant";
    const base = assessment?.title ?? "Hiring assessment";
    return `${base} — ${person}${assessment ? ` · ${jobTitle(assessment.jobId)}` : ""}`;
  };

  const pickAssessment = (jobId: string) => {
    const forJob = hiringAssessments.filter((a) => a.jobId === jobId);
    return forJob.find(isReady) ?? forJob[0] ?? null;
  };

  /** Updates the queue when an applicant enters / leaves Assessment. Returns a message suffix. */
  const reconcileQueue = (a: Applicant, stage: EmployerPipelineStage): string => {
    if (stage === "Assessment") {
      const assessment = pickAssessment(a.jobId);
      if (!assessment) {
        return " No hiring assessment is attached to this job, so nothing was queued.";
      }
      const ready = isReady(assessment);
      const state = ready ? QUEUED : ON_HOLD;
      setReviewerQueue((prev) => {
        const existing = prev.find(
          (q) => q.applicantId === a.id && q.assessmentId === assessment.id,
        );
        if (!existing) {
          return [
            ...prev,
            {
              id: `rq-${a.id}-${assessment.id}`,
              assessmentId: assessment.id,
              applicantId: a.id,
              state,
            },
          ];
        }
        return existing.state === CLOSED
          ? prev.map((q) => (q === existing ? { ...q, state } : q))
          : prev;
      });
      return ready
        ? ` Added to the reviewer queue for “${assessment.title}”.`
        : ` Queued on hold — “${assessment.title}” is still a draft.`;
    }
    if (a.stage === "Assessment") {
      setReviewerQueue((prev) =>
        stage === "Applied"
          ? prev.filter(
              (q) => !(q.applicantId === a.id && (q.state === QUEUED || q.state === ON_HOLD)),
            )
          : prev.map((q) =>
              q.applicantId === a.id && (q.state === QUEUED || q.state === ON_HOLD)
                ? { ...q, state: CLOSED }
                : q,
            ),
      );
      return " Reviewer queue updated.";
    }
    return "";
  };

  const toggleAssessment = (id: string) => {
    const item = hiringAssessments.find((a) => a.id === id);
    if (!item) return;
    const becomingReady = !isReady(item);
    setHiringAssessments((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, state: becomingReady ? "Ready" : "Draft" } : a,
      ),
    );
    const next: QueueItem[] = reviewerQueue.map((q) => {
      if (q.assessmentId !== id) return q;
      if (becomingReady && q.state === ON_HOLD) return { ...q, state: QUEUED };
      if (!becomingReady && q.state === QUEUED) return { ...q, state: ON_HOLD };
      return q;
    });
    if (becomingReady) {
      applicants
        .filter((a) => a.jobId === item.jobId && a.stage === "Assessment")
        .forEach((a) => {
          if (!next.some((q) => q.applicantId === a.id && q.assessmentId === id)) {
            next.push({
              id: `rq-${a.id}-${id}`,
              assessmentId: id,
              applicantId: a.id,
              state: QUEUED,
            });
          }
        });
    }
    setReviewerQueue(next);
    const waiting = next.filter((q) => q.assessmentId === id && q.state === QUEUED).length;
    act(
      becomingReady
        ? `“${item.title}” marked Ready — ${waiting} applicant(s) waiting in the reviewer queue.`
        : `“${item.title}” back to Draft — waiting queue items put on hold.`,
    );
  };

  const claimQueueItem = (q: QueueItem) => {
    if (q.state !== QUEUED || myReviews.some((m) => m.queueId === q.id)) return;
    setReviewerQueue((prev) => prev.map((x) => (x.id === q.id ? { ...x, state: IN_REVIEW } : x)));
    setMyReviews((prev) => [
      { id: `mr-${q.id}`, queueId: q.id, outcome: IN_PROGRESS },
      ...prev,
    ]);
    act(`Claimed “${queueTitle(q)}” into My Reviews.`);
  };

  const completeReview = (review: MyReview) => {
    setMyReviews((prev) =>
      prev.map((m) => (m.id === review.id ? { ...m, outcome: COMPLETED } : m)),
    );
    const q = reviewerQueue.find((x) => x.id === review.queueId);
    if (q) {
      setReviewerQueue((prev) => prev.map((x) => (x.id === q.id ? { ...x, state: REVIEWED } : x)));
    }
    act(`Review marked complete${q ? `: “${queueTitle(q)}”` : ""}.`);
  };

  const openQueue = (focus: { assessmentId?: string; applicantId?: string } | null) => {
    setQueueFocus(focus);
    setTab("team");
  };

  // ---- Applicant helpers ----

  const patchApplicant = (id: string, patch: Partial<Applicant>) =>
    setApplicants((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  /** Applicants that came from the candidate demo carry a bridge job id. */
  const bridgeJobIdOf = (a: Applicant): string | null => {
    if (a.bridgeJobId) return a.bridgeJobId;
    if (a.source === "bridge" || a.id.startsWith("bridge-")) {
      return a.id.replace(/^bridge-app-/, "").replace(/^bridge-/, "");
    }
    return null;
  };

  const syncBridgeStage = (a: Applicant, stage: EmployerPipelineStage) => {
    const jobId = bridgeJobIdOf(a);
    if (jobId) setApplicationStage(jobId, stage);
  };

  const setStage = (id: string, stage: EmployerPipelineStage) => {
    const a = applicants.find((x) => x.id === id);
    if (!a || a.stage === stage) return;
    patchApplicant(id, { stage });
    syncBridgeStage(a, stage);
    const suffix = reconcileQueue(a, stage);
    act(`${a.name} moved to “${stage}” for ${jobTitle(a.jobId)}.${suffix}`);
  };

  const formatWhen = (value: string) => {
    const d = new Date(value);
    return Number.isNaN(d.getTime())
      ? value
      : d.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  };

  const runInterview = (action: InterviewAction) => {
    const a = selectedApplicant;
    if (!a) return;
    const title = jobTitle(a.jobId);
    if (action === "schedule" || action === "reschedule") {
      if (!interviewWhen) return;
      const when = formatWhen(interviewWhen);
      const verb = action === "schedule" ? "Scheduled" : "Rescheduled";
      patchApplicant(a.id, { note: `${verb} for ${when}` });
      act(`Interview ${verb.toLowerCase()} for ${a.name} (${title}) — ${when}.`);
    } else if (action === "cancel") {
      patchApplicant(a.id, { note: "Interview cancelled" });
      act(`Interview cancelled for ${a.name} (${title}); stage stays “${a.stage}”.`);
    } else {
      patchApplicant(a.id, {
        stage: "Evaluated",
        note: "Evaluation notes saved",
      });
      if (a.stage !== "Evaluated") syncBridgeStage(a, "Evaluated");
      const suffix = a.stage === "Evaluated" ? "" : reconcileQueue(a, "Evaluated");
      act(`${a.name} (${title}) evaluated — stage set to “Evaluated”.${suffix}`);
    }
  };

  const createAssessment = () => {
    const title = newAssessmentTitle.trim();
    if (!title) return;
    setHiringAssessments((prev) => [
      ...prev,
      { id: `ha-${Date.now()}`, title, jobId: activeJob.id, state: "Draft" },
    ]);
    setNewAssessmentTitle("");
    act(`Created hiring assessment “${title}” and attached it to ${jobTitle(activeJob.id)} (Draft).`);
  };

  const shortlist = (person: TalentRow) => {
    const jobId = activeJob.id;
    if (applicants.some((a) => a.name === person.name && a.jobId === jobId)) return;
    setApplicants((prev) => [
      ...prev,
      {
        id: `sl-${person.id}-${jobId}`,
        name: person.name,
        jobId,
        stage: "Applied",
        source: "shortlist",
      },
    ]);
    act(`Shortlisted ${person.name} to Applicants for ${jobTitle(jobId)} (Applied).`);
  };

  // ---- Job helpers ----

  const addJob = () => {
    const id = `j-${Date.now()}`;
    setJobs((prev) => [
      ...prev,
      { id, title: "", screening: ["", ""], skills: "", location: "", published: false },
    ]);
    setActiveJobId(id);
    act("Added a new draft job (Untitled job). Name it, then publish when ready.");
  };

  const updateActiveJob = (patch: Partial<JobDraft>) => {
    setJobs((prev) => prev.map((j) => (j.id === activeJob.id ? { ...j, ...patch } : j)));
  };

  const togglePublish = () => {
    const next = !activeJob.published;
    updateActiveJob({ published: next });
    act(
      next
        ? `“${displayJobTitle(activeJob.title)}” marked Published. Publish does not invent applicants.`
        : `“${displayJobTitle(activeJob.title)}” back to Draft.`,
    );
  };

  const screeningField = (index: number) => {
    const label = `screening question ${index + 1}`;
    const current = activeJob.screening[index] ?? "";
    return {
      value: current,
      onChange: (e: ChangeEvent<HTMLTextAreaElement>) => {
        const next = [...activeJob.screening];
        while (next.length < 2) next.push("");
        next[index] = e.target.value;
        updateActiveJob({ screening: next });
      },
      onFocus: () => {
        focusValue.current = current;
      },
      onBlur: () => {
        if (current === focusValue.current) return;
        act(`Updated ${label} for “${displayJobTitle(activeJob.title)}”.`);
      },
    };
  };

  const jobField = (
    field: "title" | "skills" | "location",
    label: string,
  ) => ({
    value: activeJob[field],
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      updateActiveJob({ [field]: e.target.value }),
    onFocus: () => {
      focusValue.current = activeJob[field];
    },
    onBlur: () => {
      if (activeJob[field] === focusValue.current) return;
      act(
        field === "title"
          ? `Job renamed to “${displayJobTitle(activeJob.title)}” — applicant, assessment and queue labels follow.`
          : `Updated ${label} for “${displayJobTitle(activeJob.title)}”.`,
      );
    },
  });

  const profileField = (
    value: string,
    setValue: (v: string) => void,
    message: (v: string) => string,
  ) => ({
    value,
    onChange: (e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value),
    onFocus: () => {
      focusValue.current = value;
    },
    onBlur: () => {
      if (value !== focusValue.current) act(message(value));
    },
  });

  const sendInvite = () => {
    const email = inviteEmail.trim();
    if (!email || !email.includes("@")) {
      setInviteMsg("Enter a valid email to send an invite.");
      return;
    }
    const id = `inv-${Date.now()}`;
    setSeats((prev) => [
      ...prev,
      {
        id,
        name: email.split("@")[0],
        role: inviteRole,
        active: false,
        invited: true,
      },
    ]);
    setInviteEmail("");
    setInviteMsg(`Invite preview created for ${email} as ${inviteRole}.`);
    act(`Invite preview created for ${email} as ${inviteRole}.`);
  };

  const toggleSeat = (seatId: string) => {
    const seat = seats.find((s) => s.id === seatId);
    if (!seat) return;
    setSeats((prev) => prev.map((s) => (s.id === seatId ? { ...s, active: !s.active } : s)));
    act(`${seat.name} (${seat.role}) seat ${seat.active ? "deactivated" : "activated"}.`);
  };

  const runAiQuery = () => {
    setAiRanId(aiSelected.id);
    act(`Ran Good Practice AI Query: “${aiSelected.query}”.`);
  };

  const sourceLabel = (a: Applicant) =>
    a.source === "bridge"
      ? "From the candidate workspace"
      : a.source === "shortlist"
        ? "From Talent Search"
        : null;

  return (
    <div className="sp-panel overflow-hidden">
      <div className="border-b border-[var(--color-rule)] bg-inset px-4 py-3 sm:px-6">
        <p className="text-xs tracking-[0.16em] text-[var(--color-sky)] uppercase">
          Employer workspace
        </p>
        <p className="mt-1 text-sm text-[var(--color-faint)]">
          Explore in any order. Jobs, applicants, assessments, and team seats stay linked.
        </p>
        <DemoJourneyStrip
          steps={modules}
          activeId={modules.some((s) => s.id === tab) ? tab : null}
          justHappened={justHappened}
          activity={activity}
          ariaLabel="Hiring modules"
          onSelect={(id) => setTab(id)}
        />
      </div>
      <div className="flex gap-2 overflow-x-auto border-b border-[var(--color-rule)] px-3 py-3" role="tablist">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={cx(
              "shrink-0 rounded-full border px-3.5 py-2 text-sm",
              tab === item.id
                ? "border-[var(--color-sky)] bg-[rgb(16_113_250/0.15)] text-white"
                : "border-[var(--color-rule)] text-[var(--color-muted)]",
            )}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="p-5 sm:p-6" role="tabpanel">
        {tab === "dashboard" && (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Open jobs", value: String(jobs.filter((j) => j.published).length) },
                { label: "Applicants", value: String(applicants.length) },
                {
                  label: "In interview",
                  value: String(applicants.filter((a) => a.stage === "Interview").length),
                },
                {
                  label: "Active seats",
                  value: String(seats.filter((s) => s.active).length),
                },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl border border-[var(--color-rule)] bg-white/[0.03] p-4"
                >
                  <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-faint)]">
                    {card.label}
                  </p>
                  <p className="mt-2 text-2xl font-medium text-white">{card.value}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-[var(--color-rule)] bg-inset p-4">
                <h3 className="font-medium text-white">My Profile</h3>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  Recruiter: <span className="text-white">{recruiterName}</span>
                </p>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  Company: <span className="text-white">{companyName}</span>
                </p>
                <p className="mt-3 text-sm text-[var(--color-faint)]">
                  Seat context: recruiter and company reviewer seats manage jobs, pipeline, and
                  assessment queues without implying platform-wide admin rights.
                </p>
                <button
                  type="button"
                  className="mt-4 inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-sm text-white"
                  onClick={() => setTab("company")}
                >
                  Open Company profile
                  <ChevronRight className="size-4" aria-hidden />
                </button>
              </div>
              <div className="rounded-xl border border-[var(--color-rule)] bg-inset p-4">
                <h3 className="font-medium text-white">How it stays in sync</h3>
                <ul className="mt-3 space-y-2 text-sm text-[var(--color-muted)]">
                  <li>Jobs, applicants, and assessments share the same job IDs.</li>
                  <li>Rename a job — applicant, assessment, and queue labels update.</li>
                  <li>Dashboard counts come from those same records.</li>
                  <li>Publish does not invent applicants — open Applicants for that job next.</li>
                </ul>
                <p className="mt-3 text-xs text-[var(--color-faint)]">
                  Active job focus:{" "}
                  <span className="text-white">{jobTitle(activeJob.id)}</span> ·{" "}
                  {applicantsForActiveJob.length} linked applicant(s)
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--color-faint)]">
                  <span>
                    Reviewer queue:{" "}
                    <span className="text-white">{queuedCount} waiting</span>
                  </span>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-[var(--color-sky)] hover:underline"
                    onClick={() => openQueue(null)}
                  >
                    Open queue
                    <ChevronRight className="size-3.5" aria-hidden />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "talent" && (
          <div className="space-y-4">
            <label className="block text-xs text-[var(--color-faint)]">
              Search talent
              <input
                type="search"
                value={talentQuery}
                onChange={(e) => setTalentQuery(e.target.value)}
                placeholder="Name, role, or skill"
                className={inputCls}
              />
            </label>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => setSkillFilter(skill)}
                    className={cx(
                      "rounded-full border px-3 py-1.5 text-sm",
                      skillFilter === skill
                        ? "border-[var(--color-sky)] text-white bg-[rgb(16_113_250/0.15)]"
                        : "border-[var(--color-rule)] text-[var(--color-muted)]",
                    )}
                  >
                    {skill}
                  </button>
                ))}
              </div>
              <label className="text-xs text-[var(--color-faint)]">
                Shortlist into job
                <select
                  value={activeJob.id}
                  onChange={(e) => setActiveJobId(e.target.value)}
                  className="mt-1 block rounded-lg border border-[var(--color-rule)] bg-field px-3 py-2 text-sm text-white"
                >
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {displayJobTitle(job.title)}
                      {job.published ? "" : " (draft)"}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <ul className="space-y-3">
              {talent.map((person) => {
                const already = applicants.some(
                  (a) => a.name === person.name && a.jobId === activeJob.id,
                );
                return (
                  <li
                    key={person.id}
                    className="rounded-xl border border-[var(--color-rule)] bg-white/[0.03] p-4"
                  >
                    <div className="flex flex-wrap justify-between gap-2">
                      <div>
                        <p className="font-medium text-white">
                          {person.name}
                          {person.live ? (
                            <span className="ml-2 rounded-full border border-[var(--color-rule)] px-2 py-0.5 text-[11px] font-normal text-[var(--color-sky)]">
                              Live from candidate workspace
                            </span>
                          ) : null}
                        </p>
                        <p className="text-sm text-[var(--color-muted)]">{person.role}</p>
                      </div>
                      <p className="text-xs text-[var(--color-sky)]">{person.credential}</p>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-3 text-sm">
                      <div className="rounded-lg bg-inset-strong px-3 py-2">
                        <p className="text-xs text-[var(--color-faint)]">Skills</p>
                        <p className="mt-1 text-[var(--color-muted)]">{person.skills.join(" · ")}</p>
                      </div>
                      <div className="rounded-lg bg-inset-strong px-3 py-2">
                        <p className="text-xs text-[var(--color-faint)]">Credential status</p>
                        <p className="mt-1 text-[var(--color-muted)]">{person.credential}</p>
                      </div>
                      <div className="rounded-lg bg-inset-strong px-3 py-2">
                        <p className="text-xs text-[var(--color-faint)]">Assessment / reviews</p>
                        <p className="mt-1 text-[var(--color-muted)]">{person.evidence}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        disabled={already}
                        onClick={() => shortlist(person)}
                        className={cx(
                          "rounded-lg px-3 py-1.5 text-xs",
                          already
                            ? "bg-white/5 text-[var(--color-faint)]"
                            : "bg-white/10 text-white hover:bg-white/15",
                        )}
                      >
                        {already ? "Already in Applicants" : "Shortlist to Applicants"}
                      </button>
                      <span className="text-xs text-[var(--color-faint)]">
                        Job: {jobTitle(activeJob.id)}
                      </span>
                    </div>
                  </li>
                );
              })}
              {talent.length === 0 ? (
                <li className="rounded-xl border border-dashed border-[var(--color-rule)] px-4 py-6 text-sm text-[var(--color-faint)]">
                  No talent matches this skill and search.
                </li>
              ) : null}
            </ul>
            <p className="text-sm text-[var(--color-faint)]">
              Related:{" "}
              <Link href="/candidates/" className="text-[var(--color-sky)] hover:underline">
                For Candidates
              </Link>
            </p>
          </div>
        )}

        {tab === "jobs" && (
          <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-faint)]">
                  Job inventory
                </p>
                <button
                  type="button"
                  onClick={addJob}
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/15"
                >
                  Add job
                </button>
              </div>
              {jobs.map((job) => (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => setActiveJobId(job.id)}
                  className={cx(
                    "w-full rounded-xl border px-3 py-3 text-left",
                    activeJob.id === job.id
                      ? "border-[var(--color-sky)] bg-[rgb(16_113_250/0.12)]"
                      : "border-[var(--color-rule)] bg-white/[0.03]",
                  )}
                >
                  <p className="font-medium text-white">{displayJobTitle(job.title)}</p>
                  <p className="mt-1 text-xs text-[var(--color-faint)]">
                    {job.published ? "Published" : "Draft"}
                    {job.location.trim() ? ` · ${job.location}` : ""}
                  </p>
                  {jobHasSeedHistory(job.id) ? (
                    <span className="mt-2 block">
                      <SeedBadge short />
                    </span>
                  ) : null}
                </button>
              ))}
              <p className="text-xs text-[var(--color-faint)]">
                Edits are kept while you switch tabs.
              </p>
            </div>
            <div className="space-y-4">
              <label className="block text-sm text-[#bdb4ff]">
                Job title
                <input
                  {...jobField("title", "title")}
                  placeholder="Untitled job"
                  className={inputCls}
                />
              </label>
              {[0, 1].map((i) => (
                <label key={i} className="block text-sm text-[#bdb4ff]">
                  Screening questions · {i + 1} of 2{i === 1 ? " (optional)" : ""}
                  <textarea rows={2} {...screeningField(i)} className={inputCls} />
                </label>
              ))}
              <label className="block text-sm text-[#bdb4ff]">
                Required skills
                <input {...jobField("skills", "required skills")} className={inputCls} />
              </label>
              <label className="block text-sm text-[#bdb4ff]">
                Location
                <input {...jobField("location", "location")} className={inputCls} />
              </label>
              <div className="rounded-xl border border-[var(--color-rule)] bg-inset p-4 text-sm text-[var(--color-muted)]">
                Preview: {jobTitle(activeJob.id)} · {activeJob.skills || "—"} ·{" "}
                {activeJob.location || "—"} ·{" "}
                <span className="text-white">
                  {activeJob.published ? "Published" : "Draft"}
                </span>
                {jobHasSeedHistory(activeJob.id) ? (
                  <span className="mt-2 block">
                    <SeedBadge />
                  </span>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" className="sp-btn-primary" onClick={togglePublish}>
                  {activeJob.published ? "Unpublish job" : "Publish job"}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-rule)] px-4 py-2 text-sm text-white"
                  onClick={() => {
                    setApplicantFilter(activeJob.id);
                    setTab("pipeline");
                  }}
                >
                  View applicants for this job
                  <ChevronRight className="size-4" aria-hidden />
                </button>
              </div>
              <p className="text-xs text-[var(--color-faint)]">
                Linked now: {applicantsForActiveJob.length} applicant(s) ·{" "}
                {hiringAssessments.filter((a) => a.jobId === activeJob.id).length} hiring
                assessment(s)
              </p>
            </div>
          </div>
        )}

        {tab === "company" && (
          <div className="space-y-5">
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="block text-sm text-[#bdb4ff]">
                Company profile name
                <input
                  {...profileField(
                    companyName,
                    setCompanyName,
                    (v) => `Company profile name set to “${v.trim() || "—"}”.`,
                  )}
                  className={inputCls}
                />
              </label>
              <label className="block text-sm text-[#bdb4ff]">
                Recruiter display name (My Profile)
                <input
                  {...profileField(
                    recruiterName,
                    setRecruiterName,
                    (v) => `Recruiter display name set to “${v.trim() || "—"}”.`,
                  )}
                  className={inputCls}
                />
              </label>
            </div>
            <div>
              <h3 className="font-medium text-white">Company hiring assessments</h3>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                Assessments can attach to jobs and appear in the applicant pipeline. Marking one
                Ready queues applicants already in Assessment for company reviewers.
              </p>
              <div className="mt-4 rounded-xl border border-[var(--color-rule)] bg-inset p-4">
                <label className="block text-sm text-[#bdb4ff]">
                  New hiring assessment title
                  <input
                    value={newAssessmentTitle}
                    onChange={(e) => setNewAssessmentTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") createAssessment();
                    }}
                    placeholder="e.g. System design walkthrough"
                    className={inputCls}
                  />
                </label>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className="sp-btn-primary disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!newAssessmentTitle.trim()}
                    onClick={createAssessment}
                  >
                    Create hiring assessment
                  </button>
                  <span className="text-xs text-[var(--color-faint)]">
                    Attaches to active job:{" "}
                    <span className="text-white">{jobTitle(activeJob.id)}</span> as a Draft.
                  </span>
                </div>
              </div>
              <ul className="mt-4 space-y-2">
                {hiringAssessments.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-xl border border-[var(--color-rule)] bg-white/[0.03] px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-white">{item.title}</p>
                        <p className="text-sm text-[var(--color-faint)]">
                          Attached to: {jobTitle(item.jobId)}
                        </p>
                      </div>
                      <span className="text-xs text-[var(--color-sky)]">{item.state}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs text-[var(--color-sky)] hover:underline"
                        onClick={() => {
                          setActiveJobId(item.jobId);
                          setTab("jobs");
                        }}
                      >
                        Open linked job
                        <ChevronRight className="size-3.5" aria-hidden />
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs text-[var(--color-sky)] hover:underline"
                        onClick={() => openQueue({ assessmentId: item.id })}
                      >
                        Open queue
                        <ChevronRight className="size-3.5" aria-hidden />
                      </button>
                      <button
                        type="button"
                        className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white"
                        onClick={() => toggleAssessment(item.id)}
                      >
                        {isReady(item) ? "Mark as Draft" : "Mark as Ready"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab === "pipeline" && (
          <div className="space-y-4">
            <p className="text-sm text-[var(--color-muted)]">
              Applicants are linked to jobs. Publishing a job does not create applicants —
              shortlist from Talent Search, move stages, and run interview actions for the
              selected applicant.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setApplicantFilter("all")}
                className={cx(
                  "rounded-full border px-3 py-1.5 text-xs",
                  applicantFilter === "all"
                    ? "border-[var(--color-sky)] text-white"
                    : "border-[var(--color-rule)] text-[var(--color-muted)]",
                )}
              >
                All jobs
              </button>
              {jobs.map((job) => (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => {
                    setActiveJobId(job.id);
                    setApplicantFilter(job.id);
                  }}
                  className={cx(
                    "rounded-full border px-3 py-1.5 text-xs",
                    applicantFilter === job.id
                      ? "border-[var(--color-sky)] text-white"
                      : "border-[var(--color-rule)] text-[var(--color-muted)]",
                  )}
                >
                  {displayJobTitle(job.title)}
                </button>
              ))}
            </div>
            {visibleApplicants.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[var(--color-rule)] px-4 py-6 text-sm text-[var(--color-faint)]">
                No applicants linked to this job yet. Switch job filter or shortlist someone
                from Talent Search.
              </p>
            ) : null}
            {visibleApplicants.map((a) => {
              const selected = selectedApplicant?.id === a.id;
              const tag = sourceLabel(a);
              return (
                <div
                  key={a.id}
                  className={cx(
                    "rounded-xl border bg-white/[0.03] p-4",
                    selected ? "border-[var(--color-sky)]" : "border-[var(--color-rule)]",
                  )}
                >
                  <div className="flex flex-wrap justify-between gap-2">
                    <div>
                      <p className="font-medium text-white">{a.name}</p>
                      <p className="text-sm text-[var(--color-faint)]">{jobTitle(a.jobId)}</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {tag ? (
                          <span className="rounded-full border border-[var(--color-rule)] px-2 py-0.5 text-[11px] text-[var(--color-muted)]">
                            {tag}
                          </span>
                        ) : null}
                        {jobHasSeedHistory(a.jobId) && !a.source ? <SeedBadge /> : null}
                      </div>
                    </div>
                    <span className="text-xs text-[var(--color-sky)]">{a.stage}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {employerPipelineStages.map((stage) => (
                      <button
                        key={stage}
                        type="button"
                        onClick={() => setStage(a.id, stage)}
                        className={cx(
                          "rounded-lg px-3 py-1.5 text-xs",
                          a.stage === stage
                            ? "bg-[var(--color-violet-hi)] text-white"
                            : "bg-white/5 text-[var(--color-muted)]",
                        )}
                      >
                        {stage}
                      </button>
                    ))}
                  </div>
                  {a.note ? <p className="mt-3 text-sm text-white">{a.note}</p> : null}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => setInterviewApplicantId(a.id)}
                      className="text-[var(--color-sky)] hover:underline"
                    >
                      {selected ? "Selected for interview actions" : "Select for interview actions"}
                    </button>
                    {a.stage === "Assessment" ? (
                      <button
                        type="button"
                        onClick={() => openQueue({ applicantId: a.id })}
                        className="inline-flex items-center gap-1 text-[var(--color-sky)] hover:underline"
                      >
                        Open queue
                        <ChevronRight className="size-3.5" aria-hidden />
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
            <div className="rounded-xl border border-[var(--color-rule)] bg-inset p-4 space-y-3">
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-sky)]">
                Interview operations
              </p>
              {selectedApplicant ? (
                <>
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Select applicant">
                    {visibleApplicants.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setInterviewApplicantId(a.id)}
                        className={cx(
                          "rounded-full border px-3 py-1.5 text-xs",
                          selectedApplicant.id === a.id
                            ? "border-[var(--color-sky)] text-white"
                            : "border-[var(--color-rule)] text-[var(--color-muted)]",
                        )}
                      >
                        {a.name} · {jobTitle(a.jobId)}
                      </button>
                    ))}
                  </div>
                  <label className="block text-xs text-[var(--color-faint)]">
                    Interview date &amp; time (for schedule / reschedule)
                    <input
                      type="datetime-local"
                      value={interviewWhen}
                      onChange={(e) => setInterviewWhen(e.target.value)}
                      className={inputCls}
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {interviewActions.map((action) => {
                      const needsWhen =
                        (action === "schedule" || action === "reschedule") && !interviewWhen;
                      return (
                        <button
                          key={action}
                          type="button"
                          disabled={needsWhen}
                          title={needsWhen ? "Pick a date and time first" : undefined}
                          onClick={() => runInterview(action)}
                          className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white capitalize hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {action}
                        </button>
                      );
                    })}
                  </div>
                  {!interviewWhen ? (
                    <p className="text-xs text-[var(--color-faint)]">
                      Pick a date and time to enable schedule and reschedule.
                    </p>
                  ) : null}
                  <p className="text-sm text-white">
                    {selectedApplicant.name}:{" "}
                    <span className="text-[var(--color-muted)]">
                      {selectedApplicant.note ?? "No interview activity yet."}
                    </span>
                  </p>
                </>
              ) : (
                <p className="text-sm text-[var(--color-faint)]">
                  Select an applicant to schedule, reschedule, cancel, or evaluate.
                </p>
              )}
            </div>
          </div>
        )}

        {tab === "team" && (
          <div className="space-y-5">
            <div className="rounded-xl border border-[var(--color-rule)] bg-inset p-4 space-y-3">
              <h3 className="font-medium text-white">Invite teammate</h3>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                <input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="teammate@company.demo"
                  className="rounded-xl border border-[var(--color-rule)] bg-field px-4 py-3 text-white outline-none focus:border-[var(--color-sky)]"
                  aria-label="Invite email"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="rounded-xl border border-[var(--color-rule)] bg-field px-3 py-3 text-white"
                  aria-label="Invite role"
                >
                  <option>Recruiter</option>
                  <option>Company Reviewer</option>
                  <option>Company Admin</option>
                </select>
                <button type="button" className="sp-btn-primary" onClick={sendInvite}>
                  Send invite
                </button>
              </div>
              {inviteMsg ? (
                <p className="text-sm text-[var(--color-sky)]" role="status">
                  {inviteMsg}
                </p>
              ) : (
                <p className="text-xs text-[var(--color-faint)]">
                  Adds a pending seat until the invite is accepted.
                </p>
              )}
            </div>
            <ul className="space-y-2">
              {seats.map((seat) => (
                <li
                  key={seat.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-rule)] bg-white/[0.03] px-4 py-3"
                >
                  <div>
                    <p className="text-white">{seat.name}</p>
                    <p className="text-sm text-[var(--color-faint)]">
                      {seat.role}
                      {seat.invited ? " · Invited (pending)" : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white"
                    onClick={() => toggleSeat(seat.id)}
                  >
                    {seat.active ? "Deactivate seat" : "Activate seat"}
                  </button>
                </li>
              ))}
            </ul>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-[var(--color-rule)] bg-inset p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-sky)]">
                  Company reviewer Assessment queue
                </p>
                {queueFocus ? (
                  <p className="mt-2 text-xs text-[var(--color-faint)]">
                    Highlighting matching items.{" "}
                    <button
                      type="button"
                      className="text-[var(--color-sky)] hover:underline"
                      onClick={() => setQueueFocus(null)}
                    >
                      Clear
                    </button>
                  </p>
                ) : null}
                {reviewerQueue.length === 0 ? (
                  <p className="mt-3 text-sm text-[var(--color-faint)]">
                    Queue is empty. Move an applicant to Assessment or mark an assessment Ready.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {reviewerQueue.map((item) => {
                      const assessment = hiringAssessments.find((a) => a.id === item.assessmentId);
                      const highlighted =
                        !!queueFocus &&
                        ((queueFocus.assessmentId && queueFocus.assessmentId === item.assessmentId) ||
                          (queueFocus.applicantId && queueFocus.applicantId === item.applicantId)) &&
                        !!assessment;
                      const claimed = myReviews.some((m) => m.queueId === item.id);
                      return (
                        <li
                          key={item.id}
                          className={cx(
                            "rounded-lg border px-3 py-2 text-sm",
                            highlighted
                              ? "border-[var(--color-sky)] bg-[rgb(16_113_250/0.08)]"
                              : "border-transparent",
                          )}
                        >
                          <div className="flex justify-between gap-2">
                            <span className="text-[var(--color-muted)]">{queueTitle(item)}</span>
                            <span className="shrink-0 text-[var(--color-sky)]">{item.state}</span>
                          </div>
                          {item.state === QUEUED && !claimed ? (
                            <button
                              type="button"
                              className="mt-1 text-xs text-[var(--color-sky)] hover:underline"
                              onClick={() => claimQueueItem(item)}
                            >
                              Claim for My Reviews
                            </button>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              <div className="rounded-xl border border-[var(--color-rule)] bg-inset p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-sky)]">
                  My Reviews
                </p>
                <ul className="mt-3 space-y-2">
                  {myReviews.map((item) => {
                    const q = item.queueId
                      ? reviewerQueue.find((x) => x.id === item.queueId)
                      : undefined;
                    const title = q
                      ? queueTitle(q)
                      : `${item.title ?? "Review"}${item.jobId ? ` · ${jobTitle(item.jobId)}` : ""}`;
                    return (
                      <li key={item.id} className="text-sm">
                        <div className="flex justify-between gap-2">
                          <span className="text-[var(--color-muted)]">{title}</span>
                          <span className="shrink-0 text-[var(--color-sky)]">{item.outcome}</span>
                        </div>
                        {item.outcome === IN_PROGRESS ? (
                          <button
                            type="button"
                            className="mt-1 text-xs text-[var(--color-sky)] hover:underline"
                            onClick={() => completeReview(item)}
                          >
                            Mark complete
                          </button>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-3 text-xs text-[var(--color-faint)]">
                  Related:{" "}
                  <Link href="/reviewers/" className="text-[var(--color-sky)] hover:underline">
                    For Reviewers
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {tab === "reporting" && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {employerSkillGaps.map((gap) => (
                <div
                  key={gap.skill}
                  className="rounded-xl border border-[var(--color-rule)] bg-white/[0.03] p-4"
                >
                  <p className="text-sm text-[var(--color-faint)]">{gap.skill}</p>
                  <p className="mt-2 text-2xl text-white">{gap.coverage}%</p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--color-sky)] to-[var(--color-violet-hi)]"
                      style={{ width: `${gap.coverage}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-[var(--color-muted)]">Team coverage</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-[var(--color-rule)] bg-inset p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-sky)]">
                Good Practice AI Query
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {employerAiQueries.map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setAiQueryId(q.id)}
                    className={cx(
                      "rounded-full border px-3 py-1.5 text-xs",
                      aiQueryId === q.id
                        ? "border-[var(--color-sky)] text-white"
                        : "border-[var(--color-rule)] text-[var(--color-muted)]",
                    )}
                  >
                    {q.query}
                  </button>
                ))}
                <button
                  type="button"
                  className="sp-btn-primary"
                  onClick={runAiQuery}
                >
                  Run query
                </button>
              </div>
              {aiRan ? (
                <>
                  <p className="mt-4 text-xs text-[var(--color-faint)]">
                    Result for: {aiRan.query}
                    {aiRan.id !== aiQueryId ? " — selection changed, press Run query to update" : ""}
                  </p>
                  <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-inset-strong p-3 text-sm text-[var(--color-muted)]">
                    {aiRan.result}
                  </pre>
                </>
              ) : (
                <p className="mt-4 rounded-lg bg-inset-strong p-3 text-sm text-[var(--color-faint)]">
                  Pick a query and press Run query to see the matches.
                </p>
              )}
              <p className="mt-2 text-xs text-[var(--color-faint)]">
                AI suggests matches; your team decides.{" "}
                <Link href="/ai/" className="text-[var(--color-sky)] hover:underline">
                  AI page
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
