"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { DemoJourneyStrip } from "@/components/interactive/DemoJourneyStrip";
import {
  candidateAiAssessmentSuggestions,
  candidateAiSummaryDraft,
  candidateAssessmentCatalog,
  candidateDocumentSamples,
  candidateDocStatusLabel,
  candidateJobSamples,
  candidateReferStats,
  candidateSelfReviewChecklist,
  candidateSampleDocumentPool,
  type CandidateDocStatus,
} from "@/data/candidates";
import { useDemoActivity } from "@/hooks/useDemoActivity";
import {
  inviteGuestReview,
  raiseTicket,
  readDemoBridge,
  recordApplication,
  submitGuestReview,
  submitMedia,
  syncDocStatus,
  writeDemoBridge,
  type DemoBridgeState,
  type DemoDocStatus,
  type GuestReviewState,
} from "@/lib/demo-bridge";
import { cx } from "@/lib/utils";

const tabs = [
  { id: "dashboard", label: "Dashboard" },
  { id: "profile", label: "Profile" },
  { id: "documents", label: "Documents" },
  { id: "assessments", label: "Assessments" },
  { id: "jobs", label: "Jobs" },
  { id: "sharing", label: "Sharing" },
  { id: "support", label: "Support & AI" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const journey = [
  { id: "profile" as const, label: "1 · Profile", doNext: "Edit profile, skills, summary, and visibility" },
  { id: "documents" as const, label: "2 · Documents", doNext: "Attach documents and see how verifier outcomes show up" },
  { id: "assessments" as const, label: "3 · Assessments", doNext: "Filter assessments, add AI suggestions to drafts, and Use template" },
  { id: "jobs" as const, label: "4 · Jobs", doNext: "Find, save, and apply to jobs" },
  { id: "sharing" as const, label: "5 · Sharing", doNext: "Public share link and guest-review approval context" },
  { id: "support" as const, label: "6 · Support & AI", doNext: "Refer & Earn, Raise Query, AI summary draft" },
];
type AssessFilter = "all" | "assessment" | "media" | "self" | "expert";

type DocItem = { id: string; label: string; kind: string; status: CandidateDocStatus };

type AssessmentItem = {
  id: string;
  title: string;
  focus: string;
  kind: "assessment" | "media" | "self" | "expert";
  source: "catalog" | "ai";
};

type ExperienceEntry = { id: string; role: string; org: string; years: string };

const guestStateLabel: Record<GuestReviewState, string> = {
  invited: "Invited",
  submitted: "Submitted",
  pending_admin: "Pending Super Admin approval",
  visible: "Visible",
  rejected: "Rejected",
};

const mediaKinds = ["video", "pdf", "link"] as const;
type MediaKind = (typeof mediaKinds)[number];

const skillOptions = [
  "React",
  "TypeScript",
  "Node.js",
  "Accessibility",
  "SQL",
  "System design",
] as const;

/** Candidate doc ids that line up with the shared bridge's seed documents. */
const bridgeDocId: Record<string, string> = {
  "doc-degree": "doc-1",
  "doc-cert": "doc-2",
  "doc-license": "doc-3",
};

const toBridgeStatus = (status: CandidateDocStatus): DemoDocStatus =>
  status === "not_submitted" ? "uploaded" : status;

const assessmentItems: AssessmentItem[] = [
  ...candidateAssessmentCatalog.map((item) => ({
    id: item.id,
    title: item.title,
    focus: item.focus,
    kind: item.kind,
    source: "catalog" as const,
  })),
  ...candidateAiAssessmentSuggestions.map((sug) => ({
    id: sug.id,
    title: sug.title,
    focus: sug.reason,
    kind: "assessment" as const,
    source: "ai" as const,
  })),
];

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "candidate";

export function CandidateExperience() {
  const [tab, setTab] = useState<TabId>("dashboard");
  const { justHappened, activity, act } = useDemoActivity();
  const [seededFromPassport, setSeededFromPassport] = useState(false);
  const [name, setName] = useState("Aarav Sharma");
  const [role, setRole] = useState("Frontend engineer");
  const [summary, setSummary] = useState(
    "Building accessible product interfaces with React and TypeScript.",
  );
  const [skills, setSkills] = useState<string[]>(["React", "TypeScript", "Accessibility"]);
  const [visibility, setVisibility] = useState<"private" | "public">("private");
  const [shareEnabled, setShareEnabled] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [docs, setDocs] = useState<DocItem[]>(
    candidateDocumentSamples.map((d) => ({ ...d })),
  );
  const [assessFilter, setAssessFilter] = useState<AssessFilter>("all");
  const [draftAssessments, setDraftAssessments] = useState<string[]>([]);
  const [startedAssessments, setStartedAssessments] = useState<string[]>([]);
  const [savedJobs, setSavedJobs] = useState<string[]>(["job-1"]);
  const [applications, setApplications] = useState<string[]>([]);
  const [jobQuery, setJobQuery] = useState("");
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [queryText, setQueryText] = useState("");
  const [querySent, setQuerySent] = useState(false);
  const [referCopied, setReferCopied] = useState(false);

  // Experience (Profile)
  const [experience, setExperience] = useState<ExperienceEntry[]>([]);
  const [expRole, setExpRole] = useState("");
  const [expOrg, setExpOrg] = useState("");
  const [expYears, setExpYears] = useState("");

  // Assessments
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [selfChecks, setSelfChecks] = useState<Record<string, number[]>>({});
  const [mediaTitle, setMediaTitle] = useState("");
  const [mediaKind, setMediaKind] = useState<MediaKind>("video");

  // Sharing
  const [guestName, setGuestName] = useState("");
  const [guestSkill, setGuestSkill] = useState<string>(skillOptions[0]);

  // Shared bridge snapshot (guest reviews, tickets, media) — refreshed on writes.
  // Null until mounted so server and first client render match.
  const [bridge, setBridge] = useState<DemoBridgeState | null>(null);
  const guestReviews = useMemo(() => bridge?.guestReviews ?? [], [bridge]);
  const tickets = useMemo(() => bridge?.tickets ?? [], [bridge]);
  const mediaSubmissions = useMemo(() => bridge?.mediaSubmissions ?? [], [bridge]);

  const refreshBridge = () => setBridge(readDemoBridge());

  // Hydrate from the cross-page bridge after mount (avoids SSR mismatch).
  useEffect(() => {
    const snapshot = readDemoBridge();
    setBridge(snapshot);
    if (snapshot.fromPassport) {
      setSeededFromPassport(true);
      setName(snapshot.candidateName);
      setRole(snapshot.candidateRole);
      setSkills(snapshot.skills);
      setSummary(snapshot.summary);
    }
    if (snapshot.applications.length) {
      setApplications(snapshot.applications.map((a) => a.jobId));
    }
    // Keep guest reviews / tickets live when another demo (e.g. Super Admin) writes.
    const onBridge = () => setBridge(readDemoBridge());
    window.addEventListener("sp-demo-bridge", onBridge);
    return () => window.removeEventListener("sp-demo-bridge", onBridge);
  }, []);

  const strength = useMemo(() => {
    let s = 0;
    if (name.trim()) s += 12;
    if (role.trim()) s += 10;
    if (summary.trim().length >= 20) s += 16;
    if (skills.length) s += 14;
    if (docs.some((d) => d.status === "verified")) s += 14;
    if (docs.some((d) => d.status === "in_review")) s += 8;
    if (draftAssessments.length || startedAssessments.length) s += 12;
    if (shareEnabled || visibility === "public") s += 8;
    if (applications.length) s += 6;
    if (experience.length) s += 8;
    if (completedIds.length) s += 4;
    return Math.min(100, s);
  }, [
    name,
    role,
    summary,
    skills,
    docs,
    draftAssessments,
    startedAssessments,
    completedIds,
    experience,
    shareEnabled,
    visibility,
    applications,
  ]);

  const docsInReview = docs.filter((d) => d.status === "in_review").length;
  const inProgressCount = startedAssessments.filter((id) => !completedIds.includes(id)).length;

  const nextActions = useMemo(() => {
    const items: Array<{ label: string; tab: TabId }> = [];
    if (!docs.some((d) => d.status === "verified"))
      items.push({ label: "Verify a document — submit one for review", tab: "documents" });
    else if (docs.some((d) => d.status === "needs_info"))
      items.push({ label: "Resolve a document marked “Needs info”", tab: "documents" });
    if (!startedAssessments.length && !completedIds.length)
      items.push({ label: "Start an assessment from a template", tab: "assessments" });
    else if (startedAssessments.some((id) => !completedIds.includes(id)))
      items.push({ label: "Complete an assessment you started", tab: "assessments" });
    if (!experience.length)
      items.push({ label: "Add work experience to your profile", tab: "profile" });
    if (summary.trim().length < 20)
      items.push({ label: "Write a professional summary (20+ characters)", tab: "profile" });
    if (!shareEnabled && visibility !== "public")
      items.push({ label: "Enable your share link or make the profile public", tab: "sharing" });
    if (!guestReviews.some((g) => g.state === "visible"))
      items.push({ label: "Invite a guest to review one of your skills", tab: "sharing" });
    if (!applications.length)
      items.push({ label: "Apply to a job", tab: "jobs" });
    return items.slice(0, 5);
  }, [
    docs,
    startedAssessments,
    completedIds,
    experience,
    summary,
    shareEnabled,
    visibility,
    guestReviews,
    applications,
  ]);

  const notifications = useMemo(() => {
    const lines: string[] = [];
    for (const d of docs) {
      if (d.status === "in_review") lines.push(`Document “${d.label}” is in review`);
      else if (d.status === "needs_info")
        lines.push(`Document “${d.label}” needs more information`);
      else if (d.status === "verified")
        lines.push(`Document “${d.label}” was verified`);
      else lines.push(`Document “${d.label}” has not been submitted yet`);
    }
    if (draftAssessments.length) {
      lines.push(
        `${draftAssessments.length} assessment draft${draftAssessments.length === 1 ? "" : "s"} ready — use a template to start`,
      );
    }
    if (startedAssessments.length) {
      lines.push(
        `${startedAssessments.length} assessment${startedAssessments.length === 1 ? "" : "s"} in progress`,
      );
    }
    for (const id of applications) {
      const job = candidateJobSamples.find((j) => j.id === id);
      if (job) lines.push(`Application sent — ${job.title} at ${job.company}`);
    }
    if (completedIds.length) {
      lines.push(
        `${completedIds.length} assessment${completedIds.length === 1 ? "" : "s"} completed`,
      );
    }
    for (const g of guestReviews) {
      if (g.state === "pending_admin")
        lines.push(`Guest review from ${g.guest} awaits Super Admin approval`);
      else if (g.state === "visible")
        lines.push(`Guest review from ${g.guest} is visible`);
      else if (g.state === "invited")
        lines.push(`Guest invite to ${g.guest} is waiting for their review`);
      else if (g.state === "rejected")
        lines.push(`Guest review from ${g.guest} was not approved`);
    }
    return lines;
  }, [docs, draftAssessments, startedAssessments, completedIds, applications, guestReviews]);

  const filteredAssessments = assessmentItems.filter((item) =>
    assessFilter === "all" ? true : item.kind === assessFilter,
  );
  const startedItems = assessmentItems.filter((i) => startedAssessments.includes(i.id));
  const draftItems = assessmentItems.filter((i) => draftAssessments.includes(i.id));

  const filteredJobs = candidateJobSamples.filter((job) => {
    const q = jobQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      job.skills.some((sk) => sk.toLowerCase().includes(q))
    );
  });

  const shareUrl = `skillpassport.ai/p/${slugify(name)}`;

  const toggleSkill = (skill: string) => {
    const on = skills.includes(skill);
    setSkills((prev) => (on ? prev.filter((s) => s !== skill) : [...prev, skill]));
    act(`${on ? "Removed" : "Added"} skill ${skill}`);
  };

  const changeVisibility = (next: "private" | "public") => {
    setVisibility(next);
    act(`Profile visibility set to ${next}`);
  };

  const changeShare = (enabled: boolean) => {
    setShareEnabled(enabled);
    act(enabled ? "Share link enabled" : "Share link disabled");
  };

  const setDocStatus = (doc: DocItem, status: CandidateDocStatus) => {
    if (doc.status === status) return;
    setDocs((prev) => prev.map((d) => (d.id === doc.id ? { ...d, status } : d)));
    syncDocStatus(bridgeDocId[doc.id] ?? doc.id, toBridgeStatus(status), doc.label);
    act(
      `Verifier outcome: “${doc.label}” → ${candidateDocStatusLabel[status]}`,
      false,
    );
  };

  const addSampleDocument = () => {
    const sample = candidateSampleDocumentPool.find(
      (s) => !docs.some((d) => d.id === s.id),
    );
    if (!sample) return;
    setDocs((prev) => [...prev, { ...sample, status: "in_review" }]);
    const cur = readDemoBridge();
    writeDemoBridge({
      docs: [...cur.docs, { id: sample.id, label: sample.label, status: "in_review" }],
    });
    act(`Added document “${sample.label}” — submitted for review (not verified)`);
  };

  const addDraft = (item: AssessmentItem) => {
    setDraftAssessments((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));
    act(`Added “${item.title}” to drafts`);
  };

  const useTemplate = (item: AssessmentItem) => {
    setDraftAssessments((prev) => prev.filter((x) => x !== item.id));
    setStartedAssessments((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));
    act(`Started “${item.title}” from template`);
  };

  const toggleSaveJob = (job: (typeof candidateJobSamples)[number]) => {
    const saved = savedJobs.includes(job.id);
    setSavedJobs((prev) =>
      saved ? prev.filter((id) => id !== job.id) : [...prev, job.id],
    );
    act(`${saved ? "Removed saved job" : "Saved job"}: ${job.title} at ${job.company}`);
  };

  const applyToJob = (job: (typeof candidateJobSamples)[number]) => {
    if (applications.includes(job.id)) return;
    setApplications((prev) => [...prev, job.id]);
    recordApplication({ jobId: job.id, jobTitle: job.title, company: job.company });
    act(`Applied to ${job.title} at ${job.company}`, false);
  };

  const addExperience = () => {
    const r = expRole.trim();
    const o = expOrg.trim();
    if (!r || !o) return;
    setExperience((prev) => [
      ...prev,
      { id: `exp-${Date.now()}`, role: r, org: o, years: expYears.trim() },
    ]);
    setExpRole("");
    setExpOrg("");
    setExpYears("");
    act(`Added experience: ${r} at ${o}`);
  };

  const removeExperience = (entry: ExperienceEntry) => {
    setExperience((prev) => prev.filter((e) => e.id !== entry.id));
    act(`Removed experience: ${entry.role} at ${entry.org}`);
  };

  const completeAssessment = (item: AssessmentItem) => {
    if (completedIds.includes(item.id)) return;
    setCompletedIds((prev) => [...prev, item.id]);
    act(`Completed “${item.title}”`);
  };

  const toggleSelfCheck = (id: string, index: number) => {
    setSelfChecks((prev) => {
      const cur = prev[id] ?? [];
      return {
        ...prev,
        [id]: cur.includes(index) ? cur.filter((i) => i !== index) : [...cur, index],
      };
    });
  };

  const submitMediaForm = () => {
    const title = mediaTitle.trim();
    if (!title) return;
    submitMedia({ title, kind: mediaKind });
    refreshBridge();
    setMediaTitle("");
    act(`Submitted ${mediaKind} media “${title}” for review`, false);
  };

  const sendGuestInvite = () => {
    const guest = guestName.trim();
    if (!guest) return;
    inviteGuestReview({ guest, skill: guestSkill });
    refreshBridge();
    setGuestName("");
    act(`Invited ${guest} to review ${guestSkill}`, false);
  };

  const simulateGuestSubmit = (id: string, guest: string) => {
    submitGuestReview(id);
    refreshBridge();
    act(`${guest} submitted a review — awaiting Super Admin approval`, false);
  };

  const sendQuery = () => {
    const subject = queryText.trim();
    if (subject.length < 12) return;
    raiseTicket({ from: name.trim() || "Candidate", subject });
    refreshBridge();
    setQuerySent(true);
    setQueryText("");
    act("Raised a support ticket", false);
  };

  const verifiedDocs = docs.filter((d) => d.status === "verified");
  const visibleGuestReviews = guestReviews.filter((g) => g.state === "visible");

  const go = (next: TabId) => {
    setTab(next);
  };

  return (
    <div className="sp-panel overflow-hidden">
      <div className="border-b border-[var(--color-rule)] bg-inset px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs tracking-[0.16em] text-[var(--color-sky)] uppercase">
              Candidate workspace
            </p>
            <p className="mt-1 text-sm text-[var(--color-faint)]">
              Modules stay in sync — changes in one tab show up in the others.
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-medium text-white">{strength}%</p>
            <p className="text-xs text-[var(--color-faint)]">Profile strength</p>
          </div>
        </div>
        <div
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={strength}
          aria-label="Profile strength"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--color-sky)] to-[var(--color-violet-hi)] transition-[width] duration-400"
            style={{ width: `${Math.max(strength, 4)}%` }}
          />
        </div>
        {seededFromPassport ? (
          <p className="mt-3 inline-block rounded-full border border-[var(--color-sky)]/40 bg-[rgb(16_113_250/0.12)] px-3 py-1 text-xs text-[var(--color-sky)]">
            Seeded from Create Your Passport
          </p>
        ) : null}
        <DemoJourneyStrip
          steps={journey}
          activeId={journey.some((s) => s.id === tab) ? tab : null}
          justHappened={justHappened}
          activity={activity}
          overviewHint="Dashboard overview — modules stay in sync. Open any tab."
          ariaLabel="Candidate journey"
          onSelect={(id) => go(id)}
        />
      </div>

      <div
        className="flex gap-2 overflow-x-auto border-b border-[var(--color-rule)] px-3 py-3 sm:px-5"
        role="tablist"
        aria-label="Candidate modules"
      >
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={cx(
              "shrink-0 rounded-full border px-3.5 py-2 text-sm transition",
              tab === item.id
                ? "border-[var(--color-sky)] bg-[rgb(16_113_250/0.15)] text-white"
                : "border-[var(--color-rule)] text-[var(--color-muted)] hover:bg-white/5",
            )}
            onClick={() => go(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="p-5 sm:p-6" role="tabpanel">
        {tab === "dashboard" && (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { label: "Profile strength", value: `${strength}%` },
                { label: "Documents in review", value: String(docsInReview) },
                { label: "Applications", value: String(applications.length) },
                { label: "Saved jobs", value: String(savedJobs.length) },
                {
                  label: "Assessments in progress",
                  value: String(inProgressCount),
                },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl border border-[var(--color-rule)] bg-white/[0.03] p-4"
                >
                  <p className="text-xs tracking-[0.12em] text-[var(--color-faint)] uppercase">
                    {card.label}
                  </p>
                  <p className="mt-2 text-2xl font-medium text-white">{card.value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-[var(--color-rule)] bg-inset p-4">
              <h3 className="font-medium text-white">Next actions to raise your strength</h3>
              {nextActions.length ? (
                <ul className="mt-3 space-y-2">
                  {nextActions.map((item) => (
                    <li
                      key={item.label}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/[0.04] px-3 py-2 text-sm text-[var(--color-muted)]"
                    >
                      <span>{item.label}</span>
                      <button
                        type="button"
                        className="text-xs text-[var(--color-sky)] hover:underline"
                        onClick={() => go(item.tab)}
                      >
                        Open {tabs.find((t) => t.id === item.tab)?.label} →
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-[var(--color-faint)]">
                  All suggested actions are done.
                </p>
              )}
            </div>
            <div className="rounded-xl border border-[var(--color-rule)] bg-inset p-4">
              <h3 className="font-medium text-white">Notifications (derived from your activity)</h3>
              {notifications.length ? (
                <ul className="mt-3 space-y-2 text-sm text-[var(--color-muted)]">
                  {notifications.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-[var(--color-faint)]">
                  Nothing yet — add a document or start an assessment.
                </p>
              )}
            </div>
            <div className="rounded-xl border border-[var(--color-rule)] bg-inset p-4">
              <h3 className="font-medium text-white">Settings</h3>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  className={cx(
                    "rounded-full border px-3 py-1.5 text-sm",
                    emailNotifs
                      ? "border-[var(--color-sky)] text-white"
                      : "border-[var(--color-rule)] text-[var(--color-muted)]",
                  )}
                  onClick={() => {
                    setEmailNotifs(!emailNotifs);
                    act(`Email notifications turned ${emailNotifs ? "off" : "on"}`);
                  }}
                  aria-pressed={emailNotifs}
                >
                  Email notifications: {emailNotifs ? "On" : "Off"}
                </button>
                <button
                  type="button"
                  className={cx(
                    "rounded-full border px-3 py-1.5 text-sm",
                    pushNotifs
                      ? "border-[var(--color-sky)] text-white"
                      : "border-[var(--color-rule)] text-[var(--color-muted)]",
                  )}
                  onClick={() => {
                    setPushNotifs(!pushNotifs);
                    act(`Push alerts turned ${pushNotifs ? "off" : "on"}`);
                  }}
                  aria-pressed={pushNotifs}
                >
                  Push alerts: {pushNotifs ? "On" : "Off"}
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["profile", "Open profile"],
                  ["documents", "Documents"],
                  ["assessments", "Assessments"],
                  ["jobs", "Jobs"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className="rounded-lg bg-white/5 px-3 py-2 text-sm text-[var(--color-muted)] hover:bg-white/10"
                  onClick={() => go(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "profile" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <Field
                label="Display name"
                value={name}
                onChange={setName}
                onCommit={() => act("Updated display name")}
                id="cand-name"
              />
              <Field
                label="Role focus"
                value={role}
                onChange={setRole}
                onCommit={() => act("Updated role focus")}
                id="cand-role"
              />
              <Field
                label="Professional summary"
                value={summary}
                onChange={setSummary}
                onCommit={() => act("Updated professional summary")}
                id="cand-summary"
                rows={4}
              />
              <fieldset>
                <legend className="mb-2 text-sm text-[#bdb4ff]">Skills</legend>
                <div className="flex flex-wrap gap-2">
                  {skillOptions.map((skill) => {
                    const on = skills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleSkill(skill)}
                        className={cx(
                          "rounded-full border px-3 py-1.5 text-sm",
                          on
                            ? "border-[var(--color-sky)] text-white bg-[rgb(16_113_250/0.15)]"
                            : "border-[var(--color-rule)] text-[var(--color-muted)]",
                        )}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <fieldset className="rounded-xl border border-[var(--color-rule)] bg-white/[0.03] p-4">
                <legend className="px-1 text-sm text-[#bdb4ff]">Experience</legend>
                {experience.length ? (
                  <ul className="mb-4 space-y-2">
                    {experience.map((entry) => (
                      <li
                        key={entry.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-inset-strong px-3 py-2 text-sm"
                      >
                        <span className="text-white">
                          {entry.role}
                          <span className="text-[var(--color-muted)]"> · {entry.org}</span>
                          {entry.years ? (
                            <span className="text-[var(--color-faint)]">
                              {" "}
                              · {entry.years} yr{entry.years === "1" ? "" : "s"}
                            </span>
                          ) : null}
                        </span>
                        <button
                          type="button"
                          className="text-xs text-[var(--color-sky)] hover:underline"
                          aria-label={`Remove ${entry.role} at ${entry.org}`}
                          onClick={() => removeExperience(entry)}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mb-4 text-sm text-[var(--color-faint)]">
                    No experience yet — adding an entry raises profile strength.
                  </p>
                )}
                <div className="grid gap-2 sm:grid-cols-[1fr_1fr_5rem]">
                  <input
                    aria-label="Experience role"
                    value={expRole}
                    onChange={(e) => setExpRole(e.target.value)}
                    placeholder="Role"
                    className="rounded-lg border border-[var(--color-rule)] bg-field px-3 py-2 text-sm text-white outline-none focus:border-[var(--color-sky)]"
                  />
                  <input
                    aria-label="Experience organisation"
                    value={expOrg}
                    onChange={(e) => setExpOrg(e.target.value)}
                    placeholder="Organisation"
                    className="rounded-lg border border-[var(--color-rule)] bg-field px-3 py-2 text-sm text-white outline-none focus:border-[var(--color-sky)]"
                  />
                  <input
                    aria-label="Experience years"
                    value={expYears}
                    onChange={(e) => setExpYears(e.target.value.replace(/[^0-9.]/g, "").slice(0, 4))}
                    inputMode="decimal"
                    placeholder="Years"
                    className="rounded-lg border border-[var(--color-rule)] bg-field px-3 py-2 text-sm text-white outline-none focus:border-[var(--color-sky)]"
                  />
                </div>
                <button
                  type="button"
                  className="mt-3 rounded-lg bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15 disabled:opacity-40"
                  disabled={!expRole.trim() || !expOrg.trim()}
                  onClick={addExperience}
                >
                  Add experience
                </button>
              </fieldset>
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-[var(--color-rule)] bg-white/[0.03] p-4">
                <p className="text-xs tracking-[0.14em] text-[var(--color-sky)] uppercase">
                  Profile photo
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-sky)] to-[var(--color-violet-hi)] text-lg font-medium text-white">
                    {name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase() || "SP"}
                  </div>
                  <p className="text-sm text-[var(--color-muted)]">
                    Your initials show until you add a photo.
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-[var(--color-rule)] bg-white/[0.03] p-4 space-y-3">
                <p className="text-xs tracking-[0.14em] text-[var(--color-sky)] uppercase">
                  Visibility & share link
                </p>
                <VisibilityControls
                  visibility={visibility}
                  shareEnabled={shareEnabled}
                  shareUrl={shareUrl}
                  onVisibility={changeVisibility}
                  onShare={changeShare}
                />
              </div>
              <Link
                href="/create-passport/"
                className="sp-btn-primary inline-flex w-full items-center justify-center gap-1 sm:w-auto"
              >
                Open Create Your Passport
                <ChevronRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        )}

        {tab === "documents" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="max-w-xl text-sm text-[var(--color-muted)]">
                Documents upload with tracked verification status. Uploading does not
                automatically verify a credential.
              </p>
              <button
                type="button"
                className="rounded-lg bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15 disabled:opacity-40"
                disabled={candidateSampleDocumentPool.every((s) =>
                  docs.some((d) => d.id === s.id),
                )}
                onClick={addSampleDocument}
              >
                Add document
              </button>
            </div>
            {docs.map((doc) => (
              <div
                key={doc.id}
                className="rounded-xl border border-[var(--color-rule)] bg-white/[0.03] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{doc.label}</p>
                    <p className="text-sm text-[var(--color-faint)]">{doc.kind}</p>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-[var(--color-sky)]">
                    {candidateDocStatusLabel[doc.status]}
                  </span>
                </div>
                <p className="mt-3 text-xs tracking-[0.12em] text-[var(--color-faint)] uppercase">
                  Preview verifier outcome
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(Object.keys(candidateDocStatusLabel) as CandidateDocStatus[]).map(
                    (status) => (
                      <button
                        key={status}
                        type="button"
                        aria-pressed={doc.status === status}
                        onClick={() => setDocStatus(doc, status)}
                        className={cx(
                          "rounded-lg px-3 py-1.5 text-xs font-medium",
                          doc.status === status
                            ? "bg-[var(--color-violet-hi)] text-white"
                            : "bg-white/5 text-[var(--color-muted)] hover:bg-white/10",
                        )}
                      >
                        {candidateDocStatusLabel[status]}
                      </button>
                    ),
                  )}
                </div>
              </div>
            ))}
            <p className="text-sm text-[var(--color-faint)]">
              Related:{" "}
              <Link href="/verifiers/" className="text-[var(--color-sky)] hover:underline">
                For Verifiers
              </Link>{" "}
              ·{" "}
              <Link href="/trust/" className="text-[var(--color-sky)] hover:underline">
                Trust & Security
              </Link>
            </p>
          </div>
        )}

        {tab === "assessments" && (
          <div className="space-y-5">
            <div className="rounded-xl border border-[var(--color-rule)] bg-inset p-4">
              <p className="text-xs tracking-[0.14em] text-[var(--color-sky)] uppercase">
                My Assessments
              </p>
              {startedItems.length ? (
                <ul className="mt-3 space-y-2">
                  {startedItems.map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/[0.04] px-3 py-2"
                    >
                      <span className="text-sm text-white">{item.title}</span>
                      <span className="text-xs text-[var(--color-sky)]">
                        {completedIds.includes(item.id) ? "Completed" : "Started"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-[var(--color-faint)]">
                  Nothing started yet — add an item to drafts, then Use template.
                </p>
              )}
              {draftItems.length ? (
                <p className="mt-3 text-xs text-[var(--color-faint)]">
                  {draftItems.length} in drafts: {draftItems.map((i) => i.title).join(", ")}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2" role="group" aria-label="Assessment types">
              {(
                [
                  ["all", "All"],
                  ["assessment", "My Assessments"],
                  ["media", "Add Media"],
                  ["self", "Self-Reviews"],
                  ["expert", "Expert Reviews"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={assessFilter === id}
                  onClick={() => setAssessFilter(id)}
                  className={cx(
                    "rounded-full border px-3 py-1.5 text-sm",
                    assessFilter === id
                      ? "border-[var(--color-sky)] text-white bg-[rgb(16_113_250/0.15)]"
                      : "border-[var(--color-rule)] text-[var(--color-muted)]",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-sm text-[var(--color-muted)]">
              AI suggestions are drafts based on your profile skills or a target job — add
              the ones you want, then start when ready.
            </p>
            {assessFilter === "all" || assessFilter === "media" ? (
              <form
                className="rounded-xl border border-[var(--color-rule)] bg-white/[0.03] p-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  submitMediaForm();
                }}
              >
                <p className="text-xs tracking-[0.14em] text-[var(--color-sky)] uppercase">
                  Add Media
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_7rem_auto]">
                  <input
                    aria-label="Media title"
                    value={mediaTitle}
                    onChange={(e) => setMediaTitle(e.target.value)}
                    placeholder="Title (e.g. Portfolio walkthrough)"
                    className="rounded-lg border border-[var(--color-rule)] bg-field px-3 py-2 text-sm text-white outline-none focus:border-[var(--color-sky)]"
                  />
                  <select
                    aria-label="Media kind"
                    value={mediaKind}
                    onChange={(e) => setMediaKind(e.target.value as MediaKind)}
                    className="rounded-lg border border-[var(--color-rule)] bg-field px-3 py-2 text-sm text-white"
                  >
                    {mediaKinds.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="rounded-lg bg-[var(--color-violet-hi)] px-4 py-2 text-sm text-white disabled:opacity-40"
                    disabled={!mediaTitle.trim()}
                  >
                    Submit media
                  </button>
                </div>
                <p className="mt-2 text-xs text-[var(--color-faint)]">
                  Submissions queue for admin approval before review.
                </p>
                {mediaSubmissions.length ? (
                  <ul className="mt-3 space-y-1 text-sm">
                    {mediaSubmissions.map((m) => (
                      <li key={m.id} className="flex justify-between gap-2 text-[var(--color-muted)]">
                        <span>
                          {m.title} <span className="text-[var(--color-faint)]">({m.kind})</span>
                        </span>
                        <span className="text-[var(--color-sky)]">{m.state}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </form>
            ) : null}
            <ul className="space-y-2">
              {filteredAssessments.map((item) => {
                const isStarted = startedAssessments.includes(item.id);
                const isDraft = draftAssessments.includes(item.id);
                const isCompleted = completedIds.includes(item.id);
                const checks = selfChecks[item.id] ?? [];
                const showSelf = item.kind === "self" && isStarted && !isCompleted;
                return (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-rule)] bg-white/[0.03] px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-white">
                        {item.title}
                        {item.source === "ai" ? (
                          <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] tracking-[0.1em] text-[var(--color-sky)] uppercase">
                            AI suggestion
                          </span>
                        ) : null}
                      </p>
                      <p className="text-sm text-[var(--color-faint)]">{item.focus}</p>
                      {isStarted || isDraft ? (
                        <p className="mt-1 text-xs text-[var(--color-sky)]">
                          {isCompleted ? "Completed" : isStarted ? "Started" : "Draft"}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {!isDraft && !isStarted ? (
                        <button
                          type="button"
                          className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white"
                          onClick={() => addDraft(item)}
                        >
                          Add to drafts
                        </button>
                      ) : null}
                      {isDraft ? (
                        <button
                          type="button"
                          className="rounded-lg bg-[var(--color-violet-hi)] px-3 py-1.5 text-xs text-white"
                          onClick={() => useTemplate(item)}
                        >
                          Use template
                        </button>
                      ) : null}
                      {isStarted && !isCompleted && item.kind !== "self" ? (
                        <button
                          type="button"
                          className="rounded-lg bg-[var(--color-violet-hi)] px-3 py-1.5 text-xs text-white"
                          onClick={() => completeAssessment(item)}
                        >
                          Complete
                        </button>
                      ) : null}
                    </div>
                    {showSelf ? (
                      <div className="w-full rounded-lg bg-inset-strong p-3">
                        <p className="text-xs tracking-[0.12em] text-[var(--color-faint)] uppercase">
                          Self-review checklist
                        </p>
                        <ul className="mt-2 space-y-2">
                          {candidateSelfReviewChecklist.map((label, index) => (
                            <li key={label}>
                              <label className="flex items-start gap-3 text-sm text-[var(--color-muted)]">
                                <input
                                  type="checkbox"
                                  className="mt-1"
                                  checked={checks.includes(index)}
                                  onChange={() => toggleSelfCheck(item.id, index)}
                                />
                                <span>{label}</span>
                              </label>
                            </li>
                          ))}
                        </ul>
                        <button
                          type="button"
                          className="mt-3 rounded-lg bg-[var(--color-violet-hi)] px-3 py-1.5 text-xs text-white disabled:opacity-40"
                          disabled={checks.length < candidateSelfReviewChecklist.length}
                          onClick={() => completeAssessment(item)}
                        >
                          Complete
                        </button>
                        {checks.length < candidateSelfReviewChecklist.length ? (
                          <span className="ml-3 text-xs text-[var(--color-faint)]">
                            Tick all three to complete.
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            <p className="text-sm text-[var(--color-faint)]">
              Related:{" "}
              <Link href="/reviewers/" className="text-[var(--color-sky)] hover:underline">
                For Reviewers
              </Link>{" "}
              ·{" "}
              <Link href="/ai/" className="text-[var(--color-sky)] hover:underline">
                AI on SkillPassport
              </Link>
            </p>
          </div>
        )}

        {tab === "jobs" && (
          <div className="space-y-5">
            <div>
              <label htmlFor="job-q" className="mb-2 block text-sm text-[#bdb4ff]">
                Find Jobs
              </label>
              <input
                id="job-q"
                value={jobQuery}
                onChange={(e) => setJobQuery(e.target.value)}
                placeholder="Search title, company, or skill…"
                className="w-full rounded-xl border border-[var(--color-rule)] bg-field px-4 py-3 text-white outline-none focus:border-[var(--color-sky)]"
              />
            </div>
            <ul className="space-y-3">
              {filteredJobs.map((job) => {
                const saved = savedJobs.includes(job.id);
                const applied = applications.includes(job.id);
                return (
                  <li
                    key={job.id}
                    className="rounded-xl border border-[var(--color-rule)] bg-white/[0.03] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">
                          {job.title}
                          {applied ? (
                            <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] tracking-[0.1em] text-[var(--color-sky)] uppercase">
                              Applied
                            </span>
                          ) : null}
                        </p>
                        <p className="text-sm text-[var(--color-muted)]">
                          {job.company} · {job.location}
                        </p>
                        <p className="mt-2 text-xs text-[var(--color-faint)]">
                          {job.skills.join(" · ")}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white"
                          onClick={() => toggleSaveJob(job)}
                        >
                          {saved ? "Unsave" : "Save job"}
                        </button>
                        <button
                          type="button"
                          className="rounded-lg bg-[var(--color-violet-hi)] px-3 py-1.5 text-xs text-white disabled:opacity-50"
                          disabled={applied}
                          onClick={() => applyToJob(job)}
                        >
                          {applied ? "Applied" : "Apply"}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--color-rule)] bg-inset p-4">
                <p className="text-xs text-[var(--color-sky)] uppercase tracking-[0.14em]">
                  Saved Jobs
                </p>
                <p className="mt-2 text-sm text-white">
                  {savedJobs.length
                    ? candidateJobSamples
                        .filter((j) => savedJobs.includes(j.id))
                        .map((j) => j.title)
                        .join(", ")
                    : "None saved yet"}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--color-rule)] bg-inset p-4">
                <p className="text-xs text-[var(--color-sky)] uppercase tracking-[0.14em]">
                  Applications
                </p>
                <p className="mt-2 text-sm text-white">
                  {applications.length
                    ? candidateJobSamples
                        .filter((j) => applications.includes(j.id))
                        .map((j) => j.title)
                        .join(", ")
                    : "No applications yet"}
                </p>
              </div>
            </div>
            <p className="text-sm text-[var(--color-faint)]">
              Related:{" "}
              <Link href="/employers/" className="text-[var(--color-sky)] hover:underline">
                For Employers
              </Link>
            </p>
          </div>
        )}

        {tab === "sharing" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-[var(--color-rule)] bg-white/[0.03] p-4 space-y-3">
              <p className="font-medium text-white">Public profile</p>
              <p className="text-sm text-[var(--color-muted)]">
                Visibility is currently{" "}
                <span className="text-white">{visibility}</span>
                {shareEnabled ? " with a share link enabled" : ""}. Anyone with the link
                can open a shareable profile without logging in.
              </p>
              <VisibilityControls
                visibility={visibility}
                shareEnabled={shareEnabled}
                shareUrl={shareUrl}
                onVisibility={changeVisibility}
                onShare={changeShare}
              />
              <button
                type="button"
                className="text-sm text-[var(--color-sky)] hover:underline"
                onClick={() => go("profile")}
              >
                Edit details in Profile →
              </button>
            </div>
            <div className="rounded-xl border border-[var(--color-rule)] bg-white/[0.03] p-4">
              <p className="font-medium text-white">Guest review invites</p>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                Peers can endorse skills via invite. Certain outcomes may need admin
                approval before the candidate sees them.
              </p>
              <form
                className="mt-4 grid gap-2 sm:grid-cols-[1fr_10rem_auto]"
                onSubmit={(e) => {
                  e.preventDefault();
                  sendGuestInvite();
                }}
              >
                <input
                  aria-label="Guest name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Guest name"
                  className="rounded-lg border border-[var(--color-rule)] bg-field px-3 py-2 text-sm text-white outline-none focus:border-[var(--color-sky)]"
                />
                <select
                  aria-label="Skill to review"
                  value={guestSkill}
                  onChange={(e) => setGuestSkill(e.target.value)}
                  className="rounded-lg border border-[var(--color-rule)] bg-field px-3 py-2 text-sm text-white"
                >
                  {skillOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="rounded-lg bg-[var(--color-violet-hi)] px-4 py-2 text-sm text-white disabled:opacity-40"
                  disabled={!guestName.trim()}
                >
                  Send invite
                </button>
              </form>
              {guestReviews.length ? (
                <ul className="mt-4 space-y-3">
                  {guestReviews.map((review) => (
                    <li
                      key={review.id}
                      className="rounded-lg bg-inset-strong px-3 py-3 text-sm"
                    >
                      <div className="flex flex-wrap justify-between gap-2">
                        <span className="text-white">{review.guest}</span>
                        <span className="text-[var(--color-sky)]">
                          {guestStateLabel[review.state]}
                        </span>
                      </div>
                      <p className="mt-1 text-[var(--color-faint)]">
                        Skill: {review.skill}
                      </p>
                      {review.state === "invited" ? (
                        <button
                          type="button"
                          className="mt-2 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-[var(--color-muted)] hover:bg-white/15"
                          onClick={() => simulateGuestSubmit(review.id, review.guest)}
                        >
                          Mark guest review submitted
                        </button>
                      ) : null}
                      {review.state === "pending_admin" ? (
                        <p className="mt-2 text-xs text-[var(--color-faint)]">
                          Stays hidden until a Super Admin approves it — see{" "}
                          <Link
                            href="/enterprises/"
                            className="text-[var(--color-sky)] hover:underline"
                          >
                            Enterprises
                          </Link>
                          . Candidates cannot approve their own reviews.
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-[var(--color-faint)]">No guest invites yet.</p>
              )}
            </div>
            <div className="rounded-xl border border-[var(--color-sky)]/30 bg-[rgb(16_113_250/0.06)] p-4">
              <p className="text-xs tracking-[0.14em] text-[var(--color-sky)] uppercase">
                Public preview
              </p>
              <p className="mt-2 text-xs text-[var(--color-faint)]">
                What an outsider would see: only verified documents and approved guest
                reviews.
                {visibility === "private" && !shareEnabled
                  ? " (Profile is private with no share link, so this is not currently visible.)"
                  : ""}
              </p>
              <p className="mt-3 text-lg font-medium text-white">{name || "Unnamed candidate"}</p>
              <p className="text-sm text-[var(--color-muted)]">{role}</p>
              <p className="mt-2 flex flex-wrap gap-2">
                {skills.length ? (
                  skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[var(--color-faint)]">No skills listed</span>
                )}
              </p>
              <p className="mt-4 text-xs tracking-[0.12em] text-[var(--color-faint)] uppercase">
                Verified documents
              </p>
              {verifiedDocs.length ? (
                <ul className="mt-1 space-y-1 text-sm text-[var(--color-muted)]">
                  {verifiedDocs.map((d) => (
                    <li key={d.id}>{d.label}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-sm text-[var(--color-faint)]">None verified yet.</p>
              )}
              <p className="mt-4 text-xs tracking-[0.12em] text-[var(--color-faint)] uppercase">
                Guest reviews
              </p>
              {visibleGuestReviews.length ? (
                <ul className="mt-1 space-y-1 text-sm text-[var(--color-muted)]">
                  {visibleGuestReviews.map((g) => (
                    <li key={g.id}>
                      {g.guest} — {g.skill}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-sm text-[var(--color-faint)]">
                  No approved guest reviews yet.
                </p>
              )}
            </div>
          </div>
        )}

        {tab === "support" && (
          <div className="space-y-5">
            <div className="rounded-xl border border-[var(--color-rule)] bg-white/[0.03] p-4">
              <p className="font-medium text-white">AI — Suggest with AI (summary)</p>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                Generates an editable draft from profile context. Final text stays yours.
              </p>
              <button
                type="button"
                className="sp-btn-primary mt-4"
                onClick={() => {
                  setAiSummary(candidateAiSummaryDraft);
                  act("Generated AI summary draft");
                }}
              >
                Suggest summary
              </button>
              {aiSummary ? (
                <div className="mt-4 space-y-2">
                  <textarea
                    rows={4}
                    value={aiSummary}
                    onChange={(e) => setAiSummary(e.target.value)}
                    className="w-full rounded-xl border border-[var(--color-rule)] bg-field px-4 py-3 text-sm text-white outline-none focus:border-[var(--color-sky)]"
                  />
                  <button
                    type="button"
                    className="rounded-lg bg-white/10 px-3 py-2 text-sm text-white"
                    onClick={() => {
                      setSummary(aiSummary);
                      act("Applied AI summary draft to your profile");
                      setTab("profile");
                    }}
                  >
                    Apply edited draft to profile
                  </button>
                </div>
              ) : null}
            </div>

            <div className="rounded-xl border border-[var(--color-rule)] bg-white/[0.03] p-4">
              <p className="font-medium text-white">Refer & Earn</p>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                Invite people with your referral link and track who joins.
              </p>
              <dl className="mt-3 grid grid-cols-3 gap-3 text-center">
                {(
                  [
                    ["Invites", String(candidateReferStats.invites)],
                    ["Joined", String(candidateReferStats.joined)],
                    ["Earned", candidateReferStats.earned],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-inset-strong px-3 py-2">
                    <dt className="text-xs tracking-[0.12em] text-[var(--color-faint)] uppercase">
                      {label}
                    </dt>
                    <dd className="mt-1 text-lg font-medium text-white">{value}</dd>
                  </div>
                ))}
              </dl>
              <button
                type="button"
                className="mt-3 rounded-lg bg-white/10 px-3 py-2 text-sm text-white"
                onClick={() => {
                  setReferCopied(true);
                  act("Copied referral link");
                  window.setTimeout(() => setReferCopied(false), 1800);
                }}
              >
                {referCopied ? "Copied" : "Copy referral link"}
              </button>
            </div>

            <div className="rounded-xl border border-[var(--color-rule)] bg-white/[0.03] p-4">
              <p className="font-medium text-white">Notifications · Settings · Raise Query</p>
              <ul className="mt-3 space-y-2 text-sm text-[var(--color-muted)]">
                {notifications.slice(0, 3).map((line) => (
                  <li key={line}>Notification: {line}</li>
                ))}
                <li>Settings: language preference / visibility (informational)</li>
                <li>Support tickets tracked via Raise Query in the product</li>
              </ul>
              <label htmlFor="raise-q" className="mt-4 mb-2 block text-sm text-[#bdb4ff]">
                Raise Query
              </label>
              <textarea
                id="raise-q"
                rows={3}
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="Ask about verification status, assessments, or account help…"
                className="w-full rounded-xl border border-[var(--color-rule)] bg-field px-4 py-3 text-white outline-none focus:border-[var(--color-sky)]"
              />
              <button
                type="button"
                className="mt-3 rounded-lg bg-[var(--color-violet-hi)] px-4 py-2 text-sm text-white disabled:opacity-40"
                disabled={queryText.trim().length < 12}
                onClick={sendQuery}
              >
                Raise Query
              </button>
              {querySent ? (
                <p className="mt-2 text-sm text-[var(--color-sky)]" role="status">
                  Ticket raised — track it below.
                </p>
              ) : null}
              <p className="mt-5 text-xs tracking-[0.12em] text-[var(--color-faint)] uppercase">
                Your tickets
              </p>
              {tickets.length ? (
                <ul className="mt-2 space-y-2">
                  {tickets.map((t) => (
                    <li
                      key={t.id}
                      className="flex flex-wrap items-start justify-between gap-2 rounded-lg bg-inset-strong px-3 py-2 text-sm"
                    >
                      <span className="text-white">
                        {t.subject}
                        <span className="block text-xs text-[var(--color-faint)]">
                          From {t.from}
                        </span>
                      </span>
                      <span className="text-xs text-[var(--color-sky)]">{t.status}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-[var(--color-faint)]">No tickets raised yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function VisibilityControls({
  visibility,
  shareEnabled,
  shareUrl,
  onVisibility,
  onShare,
}: {
  visibility: "private" | "public";
  shareEnabled: boolean;
  shareUrl: string;
  onVisibility: (next: "private" | "public") => void;
  onShare: (enabled: boolean) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="flex items-center justify-between gap-3 text-sm text-[var(--color-muted)]">
        <span>Profile visibility</span>
        <select
          className="rounded-lg border border-[var(--color-rule)] bg-field px-3 py-2 text-white"
          value={visibility}
          onChange={(e) => onVisibility(e.target.value as "private" | "public")}
        >
          <option value="private">Private</option>
          <option value="public">Public</option>
        </select>
      </label>
      <label className="flex items-start gap-3 text-sm text-[var(--color-muted)]">
        <input
          type="checkbox"
          className="mt-1"
          checked={shareEnabled}
          onChange={(e) => onShare(e.target.checked)}
        />
        <span>
          Enable share link
          <span className="mt-1 block text-[var(--color-faint)]">
            Separate from visibility — shareable links are optional in the product.
          </span>
        </span>
      </label>
      {shareEnabled ? (
        <p className="rounded-lg bg-inset-strong px-3 py-2 text-xs text-[var(--color-sky)]">
          {shareUrl}
        </p>
      ) : null}
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  onCommit,
  rows,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Called on blur only if the value changed since focus. */
  onCommit?: () => void;
  rows?: number;
}) {
  const startValue = useRef(value);
  const shared = {
    id,
    value,
    onFocus: () => {
      startValue.current = value;
    },
    onBlur: () => {
      if (value !== startValue.current) onCommit?.();
    },
    className:
      "w-full rounded-xl border border-[var(--color-rule)] bg-field px-4 py-3 text-white outline-none focus:border-[var(--color-sky)]",
  };
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm text-[#bdb4ff]">
        {label}
      </label>
      {rows ? (
        <textarea {...shared} rows={rows} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input {...shared} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}
