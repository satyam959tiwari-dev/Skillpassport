"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DemoJourneyStrip } from "@/components/interactive/DemoJourneyStrip";
import {
  verifierBoardFilters,
  verifierCases,
  verifierCaseStatusLabel,
  verifierOutcomeLabel,
  verifierReportSamples,
  type VerifierCase,
  type VerifierCaseStatus,
  type VerifierOutcome,
} from "@/data/verifiers";
import { useDemoActivity } from "@/hooks/useDemoActivity";
import {
  raiseTicket,
  readDemoBridge,
  syncDocStatus,
  type DemoBridgeState,
  type DemoDocStatus,
} from "@/lib/demo-bridge";
import { cx } from "@/lib/utils";

const areaFilters = [
  "All areas",
  "Apply Verification",
  "Awaiting Admin",
  "Verification Board",
  "All Verifications",
] as const;

/** Same order as suggested path — Company first, then Board work. */
const opsPanels = [
  "Company",
  "Board",
  "Team",
  "Notifications",
  "Settings",
  "Queries",
] as const;

type OpsPanel = (typeof opsPanels)[number];

const journey = [
  { id: "Company" as const, label: "1 · Company", doNext: "Confirm verifier company profile context" },
  { id: "Board" as const, label: "2 · Board", doNext: "Filter areas/statuses, change case status and record outcomes" },
  { id: "Team" as const, label: "3 · Team", doNext: "Review the verifier team roles" },
  { id: "Notifications" as const, label: "4 · Notifications", doNext: "See the event log built from your case changes" },
  { id: "Settings" as const, label: "5 · Settings", doNext: "Set notification email and preferences" },
  { id: "Queries" as const, label: "6 · Queries", doNext: "Raise a support query" },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_QUERY_LENGTH = 8;

type BoardEvent = { id: number; text: string; at: string };
type QueryTicket = { id: number; text: string; at: string };
type TeamMember = { id: string; name: string; role: string; active: boolean };

const teamRoles = ["Admin", "Verifier", "Reviewer"] as const;

const initialTeam: TeamMember[] = [
  { id: "tm1", name: "Verifier Lead", role: "Admin", active: true },
  { id: "tm2", name: "Case Specialist A", role: "Verifier", active: true },
  { id: "tm3", name: "Case Specialist B", role: "Verifier", active: true },
];

function docStatusFor(status: VerifierCaseStatus, outcome: VerifierOutcome | null): DemoDocStatus {
  if (status === "completed") {
    if (outcome === "verified") return "verified";
    if (outcome === "rejected") return "needs_info";
    return "in_review";
  }
  if (status === "on_hold" || status === "escalated") return "needs_info";
  return "in_review";
}

function nowLabel() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function VerifierBoard() {
  const [ops, setOps] = useState<OpsPanel>("Board");
  const { justHappened, activity, act } = useDemoActivity();
  const [filter, setFilter] = useState<(typeof verifierBoardFilters)[number]["id"]>("all");
  const [areaFilter, setAreaFilter] =
    useState<(typeof areaFilters)[number]>("All areas");
  const [selectedId, setSelectedId] = useState<string>(verifierCases[0].id);
  const [companyName, setCompanyName] = useState("Northgate Verification");
  const [queryText, setQueryText] = useState("");
  const [queryError, setQueryError] = useState<string | null>(null);
  const [tickets, setTickets] = useState<QueryTicket[]>([]);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [emailDraft, setEmailDraft] = useState("verifier-ops@example.com");
  const [savedEmail, setSavedEmail] = useState("verifier-ops@example.com");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [reasonDraft, setReasonDraft] = useState("");
  const [events, setEvents] = useState<BoardEvent[]>([]);
  const [cases, setCases] = useState<VerifierCase[]>(() =>
    verifierCases.map((c) => ({ ...c })),
  );
  const [bridgeDocs, setBridgeDocs] = useState<DemoBridgeState["docs"]>([]);
  const [bridgeCandidate, setBridgeCandidate] = useState("Candidate");
  const [team, setTeam] = useState<TeamMember[]>(() => initialTeam.map((m) => ({ ...m })));
  const [memberName, setMemberName] = useState("");
  const [memberRole, setMemberRole] = useState<string>(teamRoles[1]);
  const [memberError, setMemberError] = useState<string | null>(null);

  useEffect(() => {
    const read = () => {
      const bridge = readDemoBridge();
      setBridgeDocs(bridge.docs);
      setBridgeCandidate(bridge.candidateName);
    };
    read();
    window.addEventListener("sp-demo-bridge", read);
    return () => window.removeEventListener("sp-demo-bridge", read);
  }, []);

  const visible = useMemo(
    () =>
      cases.filter((c) => {
        const statusOk = filter === "all" ? true : c.status === filter;
        const areaOk =
          areaFilter === "All areas"
            ? true
            : areaFilter === "Awaiting Admin"
              ? c.status === "awaiting_admin" || c.area === "Awaiting Admin"
              : c.area === areaFilter;
        return statusOk && areaOk;
      }),
    [cases, filter, areaFilter],
  );

  const selected = cases.find((c) => c.id === selectedId) ?? visible[0] ?? cases[0];

  const counts = useMemo(() => {
    const base: Record<VerifierCaseStatus, number> = {
      assigned: 0,
      awaiting_admin: 0,
      completed: 0,
      on_hold: 0,
      escalated: 0,
    };
    cases.forEach((c) => {
      base[c.status] += 1;
    });
    return base;
  }, [cases]);

  const rejections = useMemo(
    () => cases.filter((c) => c.outcome === "rejected"),
    [cases],
  );

  const companyLabel = companyName.trim() || "Your verifier company";
  const linkedDoc = selected?.docId
    ? bridgeDocs.find((d) => d.id === selected.docId)
    : undefined;

  const logEvent = (text: string) => {
    setEvents((prev) => [{ id: Date.now() + prev.length, text, at: nowLabel() }, ...prev].slice(0, 20));
  };

  /** Apply a case change, log it, sync linked doc, and surface it in the strip. */
  const updateCase = (target: VerifierCase, patch: Partial<VerifierCase>, message: string) => {
    const next: VerifierCase = { ...target, ...patch };
    setCases((prev) => prev.map((c) => (c.id === target.id ? next : c)));
    logEvent(message);
    if (next.docId) {
      syncDocStatus(next.docId, docStatusFor(next.status, next.outcome));
      act(message, false);
    } else {
      act(message);
    }
  };

  const setStatus = (target: VerifierCase, status: VerifierCaseStatus) => {
    if (target.status === status) return;
    const clearOutcome = status !== "completed" && target.outcome !== null;
    updateCase(
      target,
      clearOutcome ? { status, outcome: null, outcomeReason: "" } : { status },
      `Case ${target.id} moved to ${verifierCaseStatusLabel[status]}${
        clearOutcome ? " (outcome cleared)" : ""
      }`,
    );
    if (clearOutcome) setReasonDraft("");
  };

  const recordOutcome = (target: VerifierCase, outcome: VerifierOutcome) => {
    const reason = reasonDraft.trim();
    updateCase(
      target,
      { outcome, outcomeReason: reason, status: "completed" },
      `Case ${target.id} ${verifierOutcomeLabel[outcome].toLowerCase()}${
        reason ? ` — ${reason}` : ""
      }`,
    );
  };

  const selectCase = (c: VerifierCase) => {
    setSelectedId(c.id);
    setReasonDraft(c.outcomeReason);
  };

  const toggleNotify = () => {
    const next = !notifyEmail;
    setNotifyEmail(next);
    act(`Email notifications turned ${next ? "on" : "off"}`);
  };

  const toggleDigest = () => {
    const next = !weeklyDigest;
    setWeeklyDigest(next);
    act(`Weekly digest turned ${next ? "on" : "off"}`);
  };

  const saveEmail = () => {
    const value = emailDraft.trim();
    if (!EMAIL_PATTERN.test(value)) {
      setEmailError("Enter a valid email address, for example name@company.com.");
      return;
    }
    setEmailError(null);
    setSavedEmail(value);
    setEmailDraft(value);
    act(`Notification email saved as ${value}`);
  };

  const submitQuery = () => {
    const text = queryText.trim();
    if (text.length < MIN_QUERY_LENGTH) {
      setQueryError(
        `Query is too short — add at least ${MIN_QUERY_LENGTH} characters (currently ${text.length}).`,
      );
      return;
    }
    setQueryError(null);
    setTickets((prev) => [{ id: prev.length + 1, text, at: nowLabel() }, ...prev]);
    setQueryText("");
    raiseTicket({ from: companyLabel, subject: text });
    logEvent(`Query #${tickets.length + 1} raised: ${text}`);
    act(`Query #${tickets.length + 1} sent to support`, false);
  };

  // ---- Apply Verification intake ----

  const intakeDocs = useMemo(
    () => bridgeDocs.filter((d) => d.status === "in_review" || d.status === "uploaded"),
    [bridgeDocs],
  );

  const acceptIntake = (doc: DemoBridgeState["docs"][number]) => {
    const existing = cases.find((c) => c.docId === doc.id);
    if (existing) {
      if (existing.status === "assigned") return;
      updateCase(
        existing,
        { status: "assigned", outcome: null, outcomeReason: "" },
        `Intake “${doc.label}” accepted — case ${existing.id} moved to Assigned`,
      );
      setSelectedId(existing.id);
      return;
    }
    const nextNum =
      cases.reduce((max, c) => {
        const n = Number(c.id.replace(/\D/g, ""));
        return Number.isFinite(n) && n > max ? n : max;
      }, 100) + 1;
    const created: VerifierCase = {
      id: `V-${nextNum}`,
      title: doc.label,
      candidate: bridgeCandidate,
      status: "assigned",
      area: "Verification Board",
      note: "Accepted from Apply Verification intake.",
      docId: doc.id,
      outcome: null,
      outcomeReason: "",
    };
    setCases((prev) => [...prev, created]);
    setSelectedId(created.id);
    setReasonDraft("");
    const message = `Intake “${doc.label}” accepted — case ${created.id} created as Assigned`;
    logEvent(message);
    syncDocStatus(doc.id, "in_review");
    act(message, false);
  };

  // ---- Team ----

  const addMember = () => {
    const name = memberName.trim();
    if (!name) {
      setMemberError("Enter a name for the new team member.");
      return;
    }
    setMemberError(null);
    setTeam((prev) => [
      ...prev,
      { id: `tm-${Date.now()}`, name, role: memberRole, active: true },
    ]);
    setMemberName("");
    logEvent(`Team member added: ${name} (${memberRole})`);
    act(`Added ${name} as ${memberRole}`);
  };

  const toggleMember = (id: string) => {
    const member = team.find((m) => m.id === id);
    if (!member) return;
    setTeam((prev) => prev.map((m) => (m.id === id ? { ...m, active: !m.active } : m)));
    const message = `${member.name} ${member.active ? "deactivated" : "reactivated"}`;
    logEvent(message);
    act(message);
  };

  // ---- Report figures derived from cases ----

  const report = useMemo(() => {
    const completed = cases.filter((c) => c.status === "completed");
    const verified = completed.filter((c) => c.outcome === "verified").length;
    const dueCases = cases.filter((c) => c.dueLabel);
    const overdue = dueCases.filter(
      (c) => c.status !== "completed" && /overdue/i.test(c.dueLabel ?? ""),
    ).length;
    return {
      volume: cases.length,
      accuracy: completed.length
        ? `${Math.round((verified / completed.length) * 100)}% (${verified}/${completed.length} verified)`
        : "No completed cases yet",
      hasDue: dueCases.length > 0,
      overdue,
    };
  }, [cases]);

  const statCards: Array<[string, number]> = [
    ["Assigned", counts.assigned],
    ["Awaiting Admin", counts.awaiting_admin],
    ["On Hold", counts.on_hold],
    ["Completed", counts.completed],
    ["Escalated", counts.escalated],
  ];

  return (
    <div className="sp-panel overflow-hidden">
      <div className="border-b border-[var(--color-rule)] bg-inset px-4 py-3 sm:px-6">
        <p className="text-xs tracking-[0.16em] text-[var(--color-sky)] uppercase">
          Verification board preview
        </p>
        <h2 className="mt-1 text-lg text-white">{companyLabel}</h2>
        <p className="mt-1 text-sm text-[var(--color-faint)]">
          Counts and report volume come from the cases on this board. Use the panels in any order.
        </p>
        <DemoJourneyStrip
          steps={journey}
          activeId={ops}
          justHappened={justHappened}
          activity={activity}
          ariaLabel="Verifier journey"
          onSelect={(id) => setOps(id)}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-[var(--color-rule)] px-3 py-3">
        {opsPanels.map((panel) => (
          <button
            key={panel}
            type="button"
            onClick={() => setOps(panel)}
            className={cx(
              "shrink-0 rounded-full border px-3.5 py-2 text-sm",
              ops === panel
                ? "border-[var(--color-sky)] bg-[rgb(16_113_250/0.15)] text-white"
                : "border-[var(--color-rule)] text-[var(--color-muted)]",
            )}
          >
            {panel}
          </button>
        ))}
      </div>

      {ops !== "Board" ? (
        <div className="p-5 sm:p-6 space-y-4">
          {ops === "Company" && (
            <>
              <label className="block text-sm text-[#bdb4ff]">
                Verifier company profile
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[var(--color-rule)] bg-field px-4 py-3 text-white outline-none focus:border-[var(--color-sky)]"
                />
              </label>
              <p className="text-sm text-[var(--color-muted)]">
                Company profile context for verification operations. Administrative oversight
                remains with Super Admin where documented — see{" "}
                <Link href="/enterprises/" className="text-[var(--color-sky)] hover:underline">
                  Enterprises & Admins
                </Link>
                .
              </p>
            </>
          )}
          {ops === "Team" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[var(--color-rule)] bg-inset p-4 space-y-3">
                <p className="text-sm text-[#bdb4ff]">Add team member</p>
                <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                  <input
                    value={memberName}
                    onChange={(e) => {
                      setMemberName(e.target.value);
                      if (memberError) setMemberError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addMember();
                    }}
                    placeholder="Member name"
                    aria-label="Member name"
                    aria-invalid={memberError ? true : undefined}
                    className="rounded-xl border border-[var(--color-rule)] bg-field px-4 py-3 text-white outline-none focus:border-[var(--color-sky)]"
                  />
                  <select
                    value={memberRole}
                    onChange={(e) => setMemberRole(e.target.value)}
                    aria-label="Member role"
                    className="rounded-xl border border-[var(--color-rule)] bg-field px-3 py-3 text-white"
                  >
                    {teamRoles.map((role) => (
                      <option key={role}>{role}</option>
                    ))}
                  </select>
                  <button type="button" className="sp-btn-primary" onClick={addMember}>
                    Add member
                  </button>
                </div>
                {memberError ? (
                  <p className="text-sm text-red-300" role="alert">
                    {memberError}
                  </p>
                ) : null}
              </div>
              <ul className="space-y-2">
                {team.map((m) => (
                  <li
                    key={m.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-rule)] bg-white/[0.03] px-4 py-3 text-sm"
                  >
                    <div>
                      <span className={cx(m.active ? "text-white" : "text-[var(--color-faint)] line-through")}>
                        {m.name}
                      </span>
                      <span className="ml-3 text-[var(--color-faint)]">
                        {m.role}
                        {m.active ? "" : " · Inactive"}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white"
                      onClick={() => toggleMember(m.id)}
                      aria-pressed={!m.active}
                    >
                      {m.active ? "Deactivate" : "Reactivate"}
                    </button>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-[var(--color-faint)]">
                {team.filter((m) => m.active).length} of {team.length} members active. Changes stay
                in this session.
              </p>
            </div>
          )}
          {ops === "Notifications" && (
            <>
              <p className="text-sm text-[var(--color-muted)]">
                Event log from changes made on this board. Email delivery is{" "}
                <span className="text-white">{notifyEmail ? `on (${savedEmail})` : "off"}</span>
                {" "}— change it in Settings.
              </p>
              {events.length ? (
                <ul className="space-y-2 text-sm text-[var(--color-muted)]">
                  {events.map((e) => (
                    <li
                      key={e.id}
                      className="flex justify-between gap-3 rounded-xl border border-[var(--color-rule)] px-4 py-3"
                    >
                      <span>{e.text}</span>
                      <span className="shrink-0 text-xs text-[var(--color-faint)]">{e.at}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-xl border border-dashed border-[var(--color-rule)] px-4 py-6 text-sm text-[var(--color-faint)]">
                  No events yet. Change a case status or record an outcome on the Board and it will
                  appear here.
                </p>
              )}
            </>
          )}
          {ops === "Settings" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm text-[#bdb4ff]">
                  Notification email
                  <input
                    type="email"
                    value={emailDraft}
                    onChange={(e) => {
                      setEmailDraft(e.target.value);
                      if (emailError) setEmailError(null);
                    }}
                    aria-invalid={emailError ? true : undefined}
                    className="mt-2 w-full rounded-xl border border-[var(--color-rule)] bg-field px-4 py-3 text-white outline-none focus:border-[var(--color-sky)]"
                  />
                </label>
                {emailError ? (
                  <p className="text-sm text-red-300" role="alert">
                    {emailError}
                  </p>
                ) : (
                  <p className="text-xs text-[var(--color-faint)]">Saved: {savedEmail}</p>
                )}
                <button type="button" className="sp-btn-primary" onClick={saveEmail}>
                  Save email
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-white/10 px-3 py-2 text-sm text-white"
                  onClick={toggleNotify}
                  aria-pressed={notifyEmail}
                >
                  Email notifications: {notifyEmail ? "On" : "Off"}
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-white/10 px-3 py-2 text-sm text-white"
                  onClick={toggleDigest}
                  aria-pressed={weeklyDigest}
                >
                  Weekly digest: {weeklyDigest ? "On" : "Off"}
                </button>
              </div>
              <p className="text-xs text-[var(--color-faint)]">
                Preferences are kept in this session only and are not sent to a live workspace.
              </p>
            </div>
          )}
          {ops === "Queries" && (
            <>
              <label className="block text-sm text-[#bdb4ff]">
                Raise a query
                <textarea
                  rows={3}
                  value={queryText}
                  onChange={(e) => {
                    setQueryText(e.target.value);
                    if (queryError) setQueryError(null);
                  }}
                  aria-invalid={queryError ? true : undefined}
                  className="mt-2 w-full rounded-xl border border-[var(--color-rule)] bg-field px-4 py-3 text-white outline-none focus:border-[var(--color-sky)]"
                />
              </label>
              {queryError ? (
                <p className="text-sm text-red-300" role="alert">
                  {queryError}
                </p>
              ) : null}
              <button type="button" className="sp-btn-primary" onClick={submitQuery}>
                Submit query
              </button>
              {tickets.length ? (
                <ul className="space-y-2">
                  {tickets.map((t) => (
                    <li
                      key={t.id}
                      className="rounded-xl border border-[var(--color-rule)] px-4 py-3 text-sm text-[var(--color-muted)]"
                    >
                      <span className="text-[var(--color-sky)]">Query #{t.id}</span> · {t.at} —{" "}
                      {t.text}
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="text-xs text-[var(--color-faint)]">
                Queries are recorded in this session only and are not delivered to support.
              </p>
            </>
          )}
          <button
            type="button"
            className="inline-flex items-center gap-1 text-sm text-[var(--color-sky)] hover:underline"
            onClick={() => setOps("Board")}
          >
            Back to verification board
          </button>
        </div>
      ) : null}

      {ops === "Board" ? (
        <>
          <div className="grid gap-3 border-b border-[var(--color-rule)] p-4 sm:grid-cols-3 lg:grid-cols-5 sm:p-5">
            {statCards.map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-[var(--color-rule)] bg-white/[0.03] p-3"
              >
                <p className="text-xs text-[var(--color-faint)]">{label}</p>
                <p className="mt-1 text-2xl text-white">{String(value).padStart(2, "0")}</p>
              </div>
            ))}
          </div>
          <p className="px-4 pt-3 text-xs text-[var(--color-faint)] sm:px-5">
            Counts, report volume, and accuracy are derived from the {cases.length} cases on
            this board.
          </p>

          <div className="flex gap-2 overflow-x-auto border-b border-[var(--color-rule)] px-3 py-3">
            {areaFilters.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => setAreaFilter(area)}
                className={cx(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs",
                  areaFilter === area
                    ? "border-[var(--color-violet-line)] bg-white/8 text-white"
                    : "border-[var(--color-rule)] text-[var(--color-muted)]",
                )}
              >
                {area}
              </button>
            ))}
          </div>

          <div
            className="flex gap-2 overflow-x-auto border-b border-[var(--color-rule)] px-3 py-3"
            role="tablist"
          >
            {verifierBoardFilters.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={cx(
                  "shrink-0 rounded-full border px-3 py-1.5 text-sm",
                  filter === item.id
                    ? "border-[var(--color-sky)] bg-[rgb(16_113_250/0.15)] text-white"
                    : "border-[var(--color-rule)] text-[var(--color-muted)]",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
            {areaFilter === "Apply Verification" ? (
              <div className="space-y-3 border-b border-[var(--color-rule)] p-4 sm:p-5">
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-sky)]">
                  Intake · candidate documents needing work
                </p>
                {intakeDocs.length ? (
                  <ul className="space-y-2">
                    {intakeDocs.map((doc) => {
                      const linked = cases.find((c) => c.docId === doc.id);
                      const alreadyAssigned = linked?.status === "assigned";
                      return (
                        <li
                          key={doc.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--color-rule)] bg-white/[0.03] px-4 py-3"
                        >
                          <div>
                            <p className="text-sm text-white">{doc.label}</p>
                            <p className="text-xs text-[var(--color-faint)]">
                              {bridgeCandidate} ·{" "}
                              <span className="text-[var(--color-sky)]">
                                {doc.status.replace("_", " ")}
                              </span>
                              {linked ? ` · case ${linked.id} (${verifierCaseStatusLabel[linked.status]})` : ""}
                            </p>
                          </div>
                          <button
                            type="button"
                            disabled={alreadyAssigned}
                            onClick={() => acceptIntake(doc)}
                            className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {alreadyAssigned ? "Already assigned" : "Accept to Assigned"}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-[var(--color-faint)]">
                    No uploaded or in-review documents are waiting for intake.
                  </p>
                )}
              </div>
            ) : null}
            <ul className="divide-y divide-[var(--color-rule)]">
              {visible.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => selectCase(item)}
                    className={cx(
                      "flex w-full flex-col gap-1 px-4 py-4 text-left sm:px-5",
                      selected?.id === item.id ? "bg-white/[0.05]" : "hover:bg-white/[0.03]",
                    )}
                  >
                    <div className="flex flex-wrap justify-between gap-2">
                      <span className="font-medium text-white">
                        {item.id} · {item.title}
                      </span>
                      <span className="text-xs text-[var(--color-sky)]">
                        {verifierCaseStatusLabel[item.status]}
                        {item.outcome ? ` · ${verifierOutcomeLabel[item.outcome]}` : ""}
                      </span>
                    </div>
                    <span className="text-sm text-[var(--color-faint)]">
                      {item.area} · {item.candidate}
                    </span>
                  </button>
                </li>
              ))}
              {visible.length === 0 ? (
                <li className="px-5 py-6 text-sm text-[var(--color-muted)]">
                  No cases in this filter.
                </li>
              ) : null}
            </ul>
            </div>

            <div className="border-t border-[var(--color-rule)] p-5 lg:border-t-0 lg:border-l">
              {selected ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-sky)]">
                      Case detail
                    </p>
                    <h3 className="mt-2 text-xl text-white">
                      {selected.id} · {selected.title}
                    </h3>
                    <p className="mt-2 text-sm text-[var(--color-muted)]">{selected.note}</p>
                    <p className="mt-1 text-sm text-[var(--color-faint)]">
                      Area: {selected.area} · Candidate: {selected.candidate}
                    </p>
                    {linkedDoc ? (
                      <p className="mt-1 text-xs text-[var(--color-faint)]">
                        Linked candidate document: {linkedDoc.label} ·{" "}
                        <span className="text-[var(--color-sky)]">
                          {linkedDoc.status.replace("_", " ")}
                        </span>
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <p className="mb-2 text-sm text-[#bdb4ff]">Update status</p>
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(verifierCaseStatusLabel) as VerifierCaseStatus[]).map(
                        (status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => setStatus(selected, status)}
                            className={cx(
                              "rounded-lg px-3 py-1.5 text-xs",
                              selected.status === status
                                ? "bg-[var(--color-violet-hi)] text-white"
                                : "bg-white/5 text-[var(--color-muted)]",
                            )}
                          >
                            {verifierCaseStatusLabel[status]}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[var(--color-rule)] bg-inset p-3 space-y-3">
                    <p className="text-sm text-[#bdb4ff]">
                      Outcome:{" "}
                      <span className="text-white">
                        {selected.outcome ? verifierOutcomeLabel[selected.outcome] : "Not recorded"}
                      </span>
                    </p>
                    <label className="block text-xs text-[var(--color-faint)]">
                      Reason (optional)
                      <textarea
                        rows={2}
                        value={reasonDraft}
                        onChange={(e) => setReasonDraft(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-[var(--color-rule)] bg-field px-3 py-2 text-sm text-white outline-none focus:border-[var(--color-sky)]"
                      />
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(["verified", "rejected"] as const).map((outcome) => (
                        <button
                          key={outcome}
                          type="button"
                          onClick={() => recordOutcome(selected, outcome)}
                          className={cx(
                            "rounded-lg px-3 py-1.5 text-xs",
                            selected.outcome === outcome
                              ? "bg-[var(--color-violet-hi)] text-white"
                              : "bg-white/10 text-[var(--color-muted)]",
                          )}
                        >
                          Mark {verifierOutcomeLabel[outcome]}
                        </button>
                      ))}
                    </div>
                    {selected.outcome === "rejected" && selected.outcomeReason ? (
                      <p className="text-xs text-[var(--color-faint)]">
                        Reason on record: {selected.outcomeReason}
                      </p>
                    ) : null}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {[
                      {
                        label: "Volume",
                        value: `${report.volume} case${report.volume === 1 ? "" : "s"}`,
                      },
                      { label: "Accuracy", value: report.accuracy },
                      { label: "SLA", value: verifierReportSamples.sla },
                      ...(report.hasDue
                        ? [{ label: "Overdue", value: `${report.overdue} case${report.overdue === 1 ? "" : "s"}` }]
                        : []),
                    ].map((r) => (
                      <div key={r.label} className="rounded-lg bg-inset-strong p-3">
                        <p className="text-xs text-[var(--color-faint)]">{r.label}</p>
                        <p className="mt-1 text-sm text-white">{r.value}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="mb-2 text-sm text-[#bdb4ff]">
                      Rejections ({rejections.length})
                    </p>
                    {rejections.length ? (
                      <ul className="space-y-1.5 text-sm text-[var(--color-muted)]">
                        {rejections.map((r) => (
                          <li key={r.id} className="rounded-lg bg-inset-strong px-3 py-2">
                            <span className="text-white">{r.id}</span> · {r.title} —{" "}
                            {r.outcomeReason || "No reason given"}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-[var(--color-faint)]">No rejected cases yet.</p>
                    )}
                  </div>
                  <p className="text-sm text-[var(--color-faint)]">
                    Related:{" "}
                    <Link href="/candidates/" className="text-[var(--color-sky)] hover:underline">
                      Candidates
                    </Link>{" "}
                    ·{" "}
                    <Link href="/enterprises/" className="text-[var(--color-sky)] hover:underline">
                      Enterprises
                    </Link>{" "}
                    ·{" "}
                    <Link href="/trust/" className="text-[var(--color-sky)] hover:underline">
                      Trust
                    </Link>
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
