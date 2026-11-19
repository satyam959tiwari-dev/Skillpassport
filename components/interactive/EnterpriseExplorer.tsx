"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DemoJourneyStrip } from "@/components/interactive/DemoJourneyStrip";
import {
  orgAdminCapabilities,
  orgPermissionSlugs,
  orgRoleNames,
  sampleAffiliateCampaign,
  sampleApprovalQueues,
  sampleBillingPlans,
  sampleOrgMembers,
  sampleOrgModules,
  sampleOrganizations,
  samplePeopleInventory,
  sampleRejectionLog,
  sampleReviewForms,
  sampleReviewers,
  sampleSkillCatalog,
  sampleSupportMessages,
  sampleVerificationCases,
  superAdminGroups,
  type OrgRoleName,
  type PeopleInventoryKey,
} from "@/data/enterprises";
import { useDemoActivity } from "@/hooks/useDemoActivity";
import {
  readDemoBridge,
  resolveApproval,
  type DemoBridgeState,
} from "@/lib/demo-bridge";
import { cx } from "@/lib/utils";

const modes = [
  { id: "super", label: "Super Admin" },
  { id: "org", label: "Organization Admin" },
] as const;

const superJourney = [
  {
    id: "dashboard" as const,
    label: "Dashboard",
    doNext: "Scan platform KPIs and alerts (illustrative samples)",
  },
  {
    id: "people" as const,
    label: "People",
    doNext: "Browse candidates, job companies, jobs, and applications",
  },
  {
    id: "verification" as const,
    label: "Verification",
    doNext: "Review verifier cases and the rejection log",
  },
  {
    id: "assessments" as const,
    label: "Approvals",
    doNext: "Approve or reject distinct assessment / media / review requests",
  },
  {
    id: "support" as const,
    label: "Support",
    doNext: "Preview audit, tickets, and notifications",
  },
  {
    id: "ai" as const,
    label: "AI",
    doNext: "AI assessment-template drafts still need human publish",
  },
];

const orgJourney = [
  {
    id: "members" as const,
    label: "Members",
    doNext: "Manage members inside this organization only",
  },
  {
    id: "modules" as const,
    label: "Modules",
    doNext: "See modules available to this tenant",
  },
  {
    id: "admin" as const,
    label: "Admin",
    doNext: "Tenant workspace administration overview",
  },
  {
    id: "roles" as const,
    label: "Roles",
    doNext: "Organization-scoped roles — not platform-wide powers",
  },
];

type ApprovalState = "Pending (demo)" | "Approved (demo)" | "Rejected (demo)";

type ApprovalRow = {
  id: string;
  type: string;
  state: ApprovalState;
};

type OrgMember = { id: string; name: string; role: OrgRoleName; active: boolean };

type OrgModule = { id: string; name: string; enabled: boolean };

type ApprovalView = {
  id: string;
  type: string;
  state: ApprovalState;
  fromBridge: boolean;
};

const bridgeStateLabel: Record<DemoBridgeState["approvals"][number]["state"], ApprovalState> = {
  Pending: "Pending (demo)",
  Approved: "Approved (demo)",
  Rejected: "Rejected (demo)",
};

const permKey = (slug: string, role: OrgRoleName) => `${slug}:${role}`;

const toRoleName = (role: string): OrgRoleName =>
  role === "Organization Admin" ? "Organization Admin" : "Member";

export function EnterpriseExplorer() {
  const [mode, setMode] = useState<(typeof modes)[number]["id"]>("super");
  const [groupId, setGroupId] = useState<(typeof superAdminGroups)[number]["id"]>(
    superAdminGroups[0].id,
  );
  const [orgStep, setOrgStep] = useState<(typeof orgJourney)[number]["id"]>("members");
  const [peopleTab, setPeopleTab] = useState<PeopleInventoryKey>("candidates");
  const [approvals, setApprovals] = useState<ApprovalRow[]>(
    sampleApprovalQueues.map((q) => ({
      id: q.id,
      type: q.type,
      state: q.state as ApprovalState,
    })),
  );
  const [orgMembers, setOrgMembers] = useState<OrgMember[]>(
    sampleOrgMembers.map((m) => ({ ...m, role: toRoleName(m.role), active: true })),
  );
  const [memberName, setMemberName] = useState("");
  const [orgModules, setOrgModules] = useState<OrgModule[]>(
    sampleOrgModules.map((m) => ({ ...m })),
  );
  const [permissions, setPermissions] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const p of orgPermissionSlugs) {
      initial[permKey(p.slug, "Organization Admin")] = true;
      initial[permKey(p.slug, "Member")] = p.slug === "reports.view";
    }
    return initial;
  });
  const [skills, setSkills] = useState<string[]>([...sampleSkillCatalog]);
  const [skillDraft, setSkillDraft] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [bridge, setBridge] = useState<DemoBridgeState | null>(null);
  const { justHappened, activity, act } = useDemoActivity();

  // Read the bridge after mount (avoids SSR mismatch) and stay in sync with other demos.
  useEffect(() => {
    const read = () => setBridge(readDemoBridge());
    read();
    window.addEventListener("sp-demo-bridge", read);
    return () => window.removeEventListener("sp-demo-bridge", read);
  }, []);

  const group = superAdminGroups.find((g) => g.id === groupId) ?? superAdminGroups[0];
  const superActive = superJourney.find((s) => s.id === groupId)?.id ?? null;

  // Prefer bridge approvals; fall back to the static sample queues.
  const preferBridge = (bridge?.approvals.length ?? 0) > 0;
  const approvalRows: ApprovalView[] =
    bridge && preferBridge
      ? bridge.approvals.map((a) => ({
          id: a.id,
          type: a.type,
          state: bridgeStateLabel[a.state],
          fromBridge: true,
        }))
      : approvals.map((a) => ({ ...a, fromBridge: false }));

  const pendingApprovals =
    bridge && preferBridge
      ? bridge.approvalsPending
      : approvals.filter((a) => a.state.startsWith("Pending")).length;

  const bridgeTickets = bridge?.tickets ?? [];
  const auditPreview = (bridge?.audit ?? []).slice(0, 3);
  const referralActivity = (bridge?.activity ?? []).filter((line) => /refer/i.test(line));

  const setApproval = (row: ApprovalView, state: ApprovalState) => {
    if (row.fromBridge) {
      if (state === "Approved (demo)") resolveApproval(row.id, "Approved");
      else if (state === "Rejected (demo)") resolveApproval(row.id, "Rejected");
    } else {
      setApprovals((prev) => prev.map((a) => (a.id === row.id ? { ...a, state } : a)));
    }
    act(`${state.replace(" (demo)", "")}: ${row.type}`, !row.fromBridge);
  };

  const addSkill = () => {
    const name = skillDraft.trim();
    if (!name) {
      act("Enter a skill name to add.", false);
      return;
    }
    if (skills.some((s) => s.toLowerCase() === name.toLowerCase())) {
      act(`“${name}” is already in the catalog.`, false);
      return;
    }
    setSkills((prev) => [...prev, name]);
    setSkillDraft("");
    act(`Added skill “${name}” (local).`, false);
  };

  const addMember = () => {
    const name = memberName.trim();
    if (!name) {
      act("Enter a member name to add.");
      return;
    }
    const id = `m-${Date.now()}`;
    setOrgMembers((prev) => [...prev, { id, name, role: "Member", active: true }]);
    setMemberName("");
    setOrgStep("members");
    act(`Added member “${name}” (local).`);
  };

  return (
    <div className="sp-panel overflow-hidden">
      <div className="border-b border-[var(--color-rule)] bg-black/20 px-4 py-3 sm:px-6">
        <p className="text-xs tracking-[0.16em] text-[var(--color-sky)] uppercase">
          Administration explorer
        </p>
        <p className="mt-1 text-sm text-[var(--color-faint)]">
          Super Admin works across the platform; Organization Admin stays within one tenant. Look
          around either side — changes stay in this browser session.
        </p>
        {mode === "super" ? (
          <DemoJourneyStrip
            steps={superJourney}
            activeId={superActive}
            justHappened={justHappened}
            activity={activity}
            overviewHint="Open any Super Admin domain — order is optional."
            ariaLabel="Super Admin modules"
            onSelect={(id) => setGroupId(id)}
          />
        ) : (
          <DemoJourneyStrip
            steps={orgJourney}
            activeId={orgStep}
            justHappened={justHappened}
            activity={activity}
            overviewHint="Organization Admin modules for one tenant only."
            ariaLabel="Organization Admin modules"
            onSelect={(id) => setOrgStep(id)}
          />
        )}
      </div>

      <div className="flex gap-2 border-b border-[var(--color-rule)] px-3 py-3" role="tablist">
        {modes.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={mode === item.id}
            className={cx(
              "rounded-full border px-3.5 py-2 text-sm",
              mode === item.id
                ? "border-[var(--color-sky)] bg-[rgb(16_113_250/0.15)] text-white"
                : "border-[var(--color-rule)] text-[var(--color-muted)]",
            )}
            onClick={() => {
              setMode(item.id);
              act(
                item.id === "super"
                  ? "Switched to Super Admin (platform scope)."
                  : "Switched to Organization Admin (tenant scope).",
              );
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {mode === "super" ? (
        <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border-b border-[var(--color-rule)] p-3 lg:border-b-0 lg:border-r lg:p-4">
            <p className="mb-3 px-2 text-xs uppercase tracking-[0.14em] text-[var(--color-faint)]">
              Documented domains
            </p>
            <ul className="space-y-1">
              {superAdminGroups.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setGroupId(item.id)}
                    className={cx(
                      "w-full rounded-xl px-3 py-2.5 text-left text-sm",
                      groupId === item.id
                        ? "bg-white/8 text-white"
                        : "text-[var(--color-muted)] hover:bg-white/4",
                    )}
                  >
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-5 p-5 sm:p-6">
            <div>
              <h3 className="text-xl font-medium text-white">{group.title}</h3>
              <ul className="mt-4 space-y-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-lg bg-white/[0.04] px-3 py-2 text-sm text-[var(--color-muted)]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {groupId === "dashboard" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Open applications (demo)", value: "128" },
                  { label: "Verification in progress", value: "36" },
                  {
                    label: "Approvals awaiting action",
                    value: String(pendingApprovals),
                  },
                  { label: "Support tickets", value: String(bridgeTickets.length) },
                  { label: "Alerts (demo)", value: "4" },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="rounded-xl border border-[var(--color-rule)] bg-black/20 p-4"
                  >
                    <p className="text-xs text-[var(--color-faint)]">{kpi.label}</p>
                    <p className="mt-2 text-xl text-white">{kpi.value}</p>
                  </div>
                ))}
                <div className="sm:col-span-2 rounded-xl border border-[var(--color-rule)] bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-sky)]">
                    Recent audit activity
                  </p>
                  {auditPreview.length ? (
                    <ul className="mt-3 space-y-1.5">
                      {auditPreview.map((line, i) => (
                        <li key={`${i}-${line}`} className="text-sm text-[var(--color-muted)]">
                          {line}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-[var(--color-faint)]">
                      Nothing logged yet — try an action in another demo.
                    </p>
                  )}
                </div>
                <p className="sm:col-span-2 text-xs text-[var(--color-faint)]">
                  Most cards are illustrative samples. Approvals, tickets, and audit lines follow
                  this browser session&apos;s demo activity.
                </p>
              </div>
            ) : null}

            {groupId === "people" ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(samplePeopleInventory) as PeopleInventoryKey[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setPeopleTab(key);
                        act(`Opened ${samplePeopleInventory[key].label} inventory.`);
                      }}
                      className={cx(
                        "rounded-full border px-3 py-1.5 text-xs",
                        peopleTab === key
                          ? "border-[var(--color-sky)] text-white"
                          : "border-[var(--color-rule)] text-[var(--color-muted)]",
                      )}
                    >
                      {samplePeopleInventory[key].label}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-[var(--color-sky)]">
                  {samplePeopleInventory[peopleTab].total}
                </p>
                <ul className="space-y-2">
                  {samplePeopleInventory[peopleTab].rows.map((row) => (
                    <li
                      key={row.name}
                      className="rounded-lg bg-white/[0.04] px-3 py-2 text-sm"
                    >
                      <p className="text-white">{row.name}</p>
                      <p className="text-[var(--color-faint)]">{row.meta}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {groupId === "verification" ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-[var(--color-rule)] bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-sky)]">
                    Verification cases
                  </p>
                  <ul className="mt-3 space-y-2">
                    {sampleVerificationCases.map((c) => (
                      <li key={c.id} className="flex flex-wrap justify-between gap-2 text-sm">
                        <span className="text-[var(--color-muted)]">{c.subject}</span>
                        <span className="text-[var(--color-sky)]">
                          {c.state} · {c.verifier}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-[var(--color-rule)] bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-sky)]">
                    Rejection log
                  </p>
                  <ul className="mt-3 space-y-2">
                    {sampleRejectionLog.map((r) => (
                      <li key={r.id} className="text-sm">
                        <p className="text-white">{r.subject}</p>
                        <p className="text-[var(--color-muted)]">{r.reason}</p>
                        <p className="text-xs text-[var(--color-faint)]">{r.when}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href="/verifiers/" className="text-sm text-[var(--color-sky)] hover:underline">
                  Open verifier company board
                </Link>
              </div>
            ) : null}

            {groupId === "assessments" ? (
              <div className="rounded-xl border border-[var(--color-rule)] bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-sky)]">
                  Approval requests · {pendingApprovals} pending
                </p>
                <ul className="mt-3 space-y-3">
                  {approvalRows.map((q) => (
                    <li
                      key={q.id}
                      className="rounded-lg border border-[var(--color-rule)] bg-black/20 px-3 py-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="text-sm text-white">{q.type}</p>
                        <span className="text-xs text-[var(--color-sky)]">{q.state}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white"
                          onClick={() => setApproval(q, "Approved (demo)")}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-[var(--color-rule)] px-3 py-1.5 text-xs text-[var(--color-muted)]"
                          onClick={() => setApproval(q, "Rejected (demo)")}
                        >
                          Reject
                        </button>
                        {!q.fromBridge && q.state !== "Pending (demo)" ? (
                          <button
                            type="button"
                            className="rounded-lg px-3 py-1.5 text-xs text-[var(--color-sky)] hover:underline"
                            onClick={() => setApproval(q, "Pending (demo)")}
                          >
                            Reset
                          </button>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {groupId === "orgs" ? (
              <div className="space-y-3">
                {sampleOrganizations.map((org) => (
                  <div
                    key={org.id}
                    className="rounded-xl border border-[var(--color-rule)] bg-black/20 p-4"
                  >
                    <p className="font-medium text-white">{org.name}</p>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                      {org.members} members · {org.plan} · {org.roles.join(" · ")}
                    </p>
                  </div>
                ))}
                <p className="text-xs text-[var(--color-faint)]">
                  Platform-wide organization governance. Tenant-day-to-day work lives under
                  Organization Admin.
                </p>
              </div>
            ) : null}

            {groupId === "support" ? (
              <div className="space-y-4 text-sm">
                <div className="rounded-xl border border-[var(--color-rule)] bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-sky)]">
                    Support tickets · {bridgeTickets.length}
                  </p>
                  {bridgeTickets.length ? (
                    <ul className="mt-3 space-y-2">
                      {bridgeTickets.map((t) => (
                        <li key={t.id} className="flex flex-wrap justify-between gap-2">
                          <span className="text-[var(--color-muted)]">
                            {t.subject} <span className="text-[var(--color-faint)]">· {t.from}</span>
                          </span>
                          <span className="text-[var(--color-sky)]">{t.status}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-[var(--color-faint)]">
                      No tickets yet. Raise a query from the candidate demo and it shows up here.
                    </p>
                  )}
                </div>
                <div className="rounded-xl border border-[var(--color-rule)] bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-sky)]">
                    Audit log
                  </p>
                  <ul className="mt-3 space-y-1.5">
                    {(bridge?.audit ?? []).slice(0, 8).map((line, i) => (
                      <li key={`${i}-${line}`} className="text-[var(--color-muted)]">
                        {line}
                      </li>
                    ))}
                    {!bridge?.audit.length ? (
                      <li className="text-[var(--color-faint)]">No audit lines yet.</li>
                    ) : null}
                  </ul>
                </div>
                <div className="rounded-xl border border-[var(--color-rule)] bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-sky)]">
                    Messages & notifications
                  </p>
                  <ul className="mt-3 space-y-1.5">
                    {sampleSupportMessages.map((line) => (
                      <li key={line} className="text-[var(--color-muted)]">
                        {line}
                      </li>
                    ))}
                    {(bridge?.activity ?? []).slice(0, 3).map((line, i) => (
                      <li key={`act-${i}-${line}`} className="text-[var(--color-muted)]">
                        Activity: {line}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            {groupId === "affiliates" ? (
              <div className="space-y-3 rounded-xl border border-[var(--color-rule)] bg-black/20 p-4 text-sm text-[var(--color-muted)]">
                <p>
                  Affiliate management connects to the candidate Refer & Earn flow.{" "}
                  <Link href="/candidates/" className="text-[var(--color-sky)] hover:underline">
                    Open candidate demo
                  </Link>
                </p>
                <div className="rounded-lg bg-white/[0.04] px-3 py-2">
                  <p className="text-white">{sampleAffiliateCampaign.name}</p>
                  <p className="text-[var(--color-faint)]">
                    {sampleAffiliateCampaign.status} · {sampleAffiliateCampaign.clicks} clicks ·{" "}
                    {sampleAffiliateCampaign.signups} sign-ups (mock)
                  </p>
                </div>
                {referralActivity.length ? (
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-sky)]">
                      Referral activity from candidate demo
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {referralActivity.slice(0, 3).map((line, i) => (
                        <li key={`${i}-${line}`}>{line}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}

            {groupId === "ai" ? (
              <div className="rounded-xl border border-[var(--color-rule)] bg-black/20 p-4 text-sm text-[var(--color-muted)]">
                AI-assisted assessment templates prefill drafts for catalog seeding. Operators still
                review and publish.{" "}
                <Link href="/ai/" className="text-[var(--color-sky)] hover:underline">
                  Open AI demos
                </Link>
              </div>
            ) : null}

            {groupId === "reviews" ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-[var(--color-rule)] bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-sky)]">
                    Reviewers
                  </p>
                  <table className="mt-3 w-full text-left text-sm">
                    <thead className="text-xs text-[var(--color-faint)]">
                      <tr>
                        <th className="py-1 font-normal">Name</th>
                        <th className="py-1 font-normal">Focus</th>
                        <th className="py-1 font-normal">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-[var(--color-muted)]">
                      {sampleReviewers.map((r) => (
                        <tr key={r.id}>
                          <td className="py-1 text-white">{r.name}</td>
                          <td className="py-1">{r.focus}</td>
                          <td className="py-1">{r.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="rounded-xl border border-[var(--color-rule)] bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-sky)]">Forms</p>
                  <table className="mt-3 w-full text-left text-sm">
                    <thead className="text-xs text-[var(--color-faint)]">
                      <tr>
                        <th className="py-1 font-normal">Form</th>
                        <th className="py-1 font-normal">Fields</th>
                        <th className="py-1 font-normal">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-[var(--color-muted)]">
                      {sampleReviewForms.map((f) => (
                        <tr key={f.id}>
                          <td className="py-1 text-white">{f.name}</td>
                          <td className="py-1">{f.fields}</td>
                          <td className="py-1">{f.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {groupId === "management" ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-[var(--color-rule)] bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-sky)]">
                    Skill catalog · {skills.length}
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <li
                        key={s}
                        className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-[var(--color-muted)]"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <input
                      value={skillDraft}
                      onChange={(e) => setSkillDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addSkill();
                      }}
                      placeholder="New skill name"
                      aria-label="New skill name"
                      className="min-w-[10rem] flex-1 rounded-lg border border-[var(--color-rule)] bg-[#05071c] px-3 py-2 text-sm text-white outline-none focus:border-[var(--color-sky)]"
                    />
                    <button
                      type="button"
                      className="rounded-lg bg-white/10 px-3 py-2 text-sm text-white"
                      onClick={addSkill}
                    >
                      Add skill
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-[var(--color-rule)] bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-sky)]">
                    Billing & plans (admin module)
                  </p>
                  <table className="mt-3 w-full text-left text-sm">
                    <thead className="text-xs text-[var(--color-faint)]">
                      <tr>
                        <th className="py-1 font-normal">Plan</th>
                        <th className="py-1 font-normal">Seats</th>
                        <th className="py-1 font-normal">Price</th>
                      </tr>
                    </thead>
                    <tbody className="text-[var(--color-muted)]">
                      {sampleBillingPlans.map((p) => (
                        <tr key={p.id}>
                          <td className="py-1 text-white">{p.name}</td>
                          <td className="py-1">{p.seats}</td>
                          <td className="py-1">{p.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="rounded-xl border border-[var(--color-rule)] bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-sky)]">
                    Settings
                  </p>
                  <div className="mt-3 space-y-2">
                    <label className="flex items-center justify-between gap-3 text-sm text-[var(--color-muted)]">
                      <span>Maintenance mode</span>
                      <input
                        type="checkbox"
                        checked={maintenanceMode}
                        onChange={(e) => {
                          setMaintenanceMode(e.target.checked);
                          act(
                            `Maintenance mode ${e.target.checked ? "on" : "off"} (local).`,
                            false,
                          );
                        }}
                      />
                    </label>
                    <label className="flex items-center justify-between gap-3 text-sm text-[var(--color-muted)]">
                      <span>Email alerts</span>
                      <input
                        type="checkbox"
                        checked={emailAlerts}
                        onChange={(e) => {
                          setEmailAlerts(e.target.checked);
                          act(`Email alerts ${e.target.checked ? "on" : "off"} (local).`, false);
                        }}
                      />
                    </label>
                  </div>
                  <p className="mt-3 text-xs text-[var(--color-faint)]">
                    Toggles are local to this preview and do not change anything real.
                  </p>
                </div>
              </div>
            ) : null}

            <p className="text-sm text-[var(--color-faint)]">
              Related:{" "}
              <Link href="/trust/" className="text-[var(--color-sky)] hover:underline">
                Trust & Security
              </Link>{" "}
              ·{" "}
              <Link href="/ai/" className="text-[var(--color-sky)] hover:underline">
                Super Admin AI templates
              </Link>
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-white">Organization-scoped administration</h3>
            <p className="text-sm text-[var(--color-muted)]">
              Members, modules, and roles for one organization. Platform billing, global
              verification approvals, and cross-tenant admin stay with Super Admin.
            </p>
            {orgAdminCapabilities.map((cap) => (
              <button
                key={cap.id}
                type="button"
                onClick={() => {
                  const match = orgJourney.find((s) => s.id === cap.id);
                  if (match) setOrgStep(match.id);
                  act(`Opened “${cap.title}”.`);
                }}
                className={cx(
                  "w-full rounded-xl border p-4 text-left",
                  orgStep === cap.id
                    ? "border-[var(--color-sky)] bg-[rgb(16_113_250/0.08)]"
                    : "border-[var(--color-rule)] bg-white/[0.03]",
                )}
              >
                <p className="font-medium text-white">{cap.title}</p>
                <p className="mt-2 text-sm text-[var(--color-muted)]">{cap.body}</p>
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-[var(--color-rule)] bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-sky)]">
              {orgStep === "members"
                ? "Sample Organization A · Members"
                : orgStep === "modules"
                  ? "Available modules (tenant)"
                  : orgStep === "admin"
                    ? "Organization administration"
                    : "Scoped roles preview"}
            </p>

            {orgStep === "members" ? (
              <div className="mt-4 space-y-3">
                <ul className="space-y-2">
                  {orgMembers.map((m) => (
                    <li
                      key={m.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/[0.04] px-3 py-2 text-sm"
                    >
                      <span className={m.active ? "text-white" : "text-[var(--color-faint)] line-through"}>
                        {m.name}
                      </span>
                      <select
                        value={m.role}
                        aria-label={`Role for ${m.name}`}
                        className="rounded-lg border border-[var(--color-rule)] bg-[#05071c] px-2 py-1 text-xs text-white"
                        onChange={(e) => {
                          const role = toRoleName(e.target.value);
                          setOrgMembers((prev) =>
                            prev.map((row) => (row.id === m.id ? { ...row, role } : row)),
                          );
                          act(`Set ${m.name} to ${role} (local, this organization only).`, false);
                        }}
                      >
                        {orgRoleNames.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="text-xs text-[var(--color-sky)] hover:underline"
                        onClick={() => {
                          setOrgMembers((prev) =>
                            prev.map((row) =>
                              row.id === m.id ? { ...row, active: !row.active } : row,
                            ),
                          );
                          act(
                            m.active
                              ? `Deactivated ${m.name} (local).`
                              : `Reactivated ${m.name} (local).`,
                          );
                        }}
                      >
                        {m.active ? "Deactivate" : "Reactivate"}
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2">
                  <input
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    placeholder="New member name"
                    className="min-w-[10rem] flex-1 rounded-lg border border-[var(--color-rule)] bg-[#05071c] px-3 py-2 text-sm text-white outline-none focus:border-[var(--color-sky)]"
                  />
                  <button
                    type="button"
                    className="rounded-lg bg-white/10 px-3 py-2 text-sm text-white"
                    onClick={addMember}
                  >
                    Add member
                  </button>
                </div>
              </div>
            ) : null}

            {orgStep === "modules" ? (
              <ul className="mt-4 space-y-2 text-sm text-[var(--color-muted)]">
                {orgModules.map((mod) => (
                  <li
                    key={mod.id}
                    className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.04] px-3 py-2"
                  >
                    <span className={mod.enabled ? "text-white" : undefined}>{mod.name}</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={mod.enabled}
                      className="text-xs text-[var(--color-sky)] hover:underline"
                      onClick={() => {
                        setOrgModules((prev) =>
                          prev.map((row) =>
                            row.id === mod.id ? { ...row, enabled: !row.enabled } : row,
                          ),
                        );
                        act(
                          `${mod.enabled ? "Disabled" : "Enabled"} ${mod.name} for this organization (local).`,
                          false,
                        );
                      }}
                    >
                      {mod.enabled ? "Enabled · turn off" : "Disabled · turn on"}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            {orgStep === "admin" ? (
              <div className="mt-4 space-y-2 text-sm text-[var(--color-muted)]">
                <p className="rounded-lg bg-white/[0.04] px-3 py-2">
                  Workspace settings for Organization A only
                </p>
                <p className="rounded-lg bg-white/[0.04] px-3 py-2">
                  Invite links and seat limits (tenant-scoped)
                </p>
                <p className="rounded-lg bg-white/[0.04] px-3 py-2">
                  No cross-tenant switcher or Super Admin tools here
                </p>
              </div>
            ) : null}

            {orgStep === "roles" ? (
              <div className="mt-4 space-y-3">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-[var(--color-faint)]">
                    <tr>
                      <th className="py-1 font-normal">Permission</th>
                      {orgRoleNames.map((r) => (
                        <th key={r} className="py-1 text-center font-normal">
                          {r}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-[var(--color-muted)]">
                    {orgPermissionSlugs.map((p) => (
                      <tr key={p.slug}>
                        <td className="py-1.5">
                          <code className="text-white">{p.slug}</code>
                        </td>
                        {orgRoleNames.map((r) => (
                          <td key={r} className="py-1.5 text-center">
                            <input
                              type="checkbox"
                              aria-label={`${p.slug} for ${r}`}
                              checked={permissions[permKey(p.slug, r)] ?? false}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setPermissions((prev) => ({
                                  ...prev,
                                  [permKey(p.slug, r)]: checked,
                                }));
                                act(
                                  `${checked ? "Granted" : "Removed"} ${p.slug} for ${r} (local).`,
                                  false,
                                );
                              }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="rounded-lg bg-white/[0.04] px-3 py-2 text-xs text-[var(--color-faint)]">
                  tenant-scoped — no Super Admin powers
                </p>
              </div>
            ) : null}

            <p className="mt-4 text-xs text-[var(--color-faint)]">
              Sample organization for illustration — changes here apply to this tenant only.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
