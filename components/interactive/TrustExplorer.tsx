"use client";

import { useState } from "react";
import Link from "next/link";
import { DemoJourneyStrip } from "@/components/interactive/DemoJourneyStrip";
import { useDemoActivity } from "@/hooks/useDemoActivity";
import { trustTopics } from "@/data/trust";
import { cx } from "@/lib/utils";

const visuals: Record<
  string,
  { eyebrow: string; panels: Array<{ title: string; body: string }> }
> = {
  verify: {
    eyebrow: "Reuse with context",
    panels: [
      { title: "Upload", body: "Documents enter a tracked verification workflow." },
      { title: "Status", body: "In review, verified, or needs info — never automatic." },
      { title: "Reuse", body: "Verification state can travel across opportunities with context." },
    ],
  },
  rubrics: {
    eyebrow: "Weighted grading",
    panels: [
      { title: "Criteria", body: "Technical accuracy, problem solving, communication…" },
      { title: "Weights", body: "Each criterion contributes a documented weight." },
      { title: "Levels", body: "Performance levels support structured expert judgment." },
    ],
  },
  checklists: {
    eyebrow: "Met / not-met gates",
    panels: [
      { title: "Checklist items", body: "Evidence, format, comments, mandatory requirements." },
      { title: "Gates", body: "Mandatory items must be met before the checklist can pass." },
      { title: "Summary", body: "Progress is inspectable before outcomes are finalized." },
    ],
  },
  media: {
    eyebrow: "Rich evidence review",
    panels: [
      { title: "PDF", body: "PDF annotation inside the review workspace." },
      { title: "Video", body: "Timeline notes and evidence capture for media submissions." },
      { title: "Documents", body: "Preview supporting files alongside grading forms." },
    ],
  },
  approvals: {
    eyebrow: "Distinct approval types",
    panels: [
      { title: "Assessment / media", body: "Assignment and media approval requests." },
      { title: "Review results", body: "Super Admin approves platform and guest outcomes." },
      { title: "Not universal", body: "Approval types are distinct — not every action needs the same gate." },
    ],
  },
  permissions: {
    eyebrow: "Roles & permissions",
    panels: [
      { title: "Workspace permissions", body: "Fine-grained permissions per workspace." },
      { title: "Company roles", body: "Admin, recruiter, reviewer, verifier seats." },
      { title: "Scoped access", body: "Org Admin stays tenant-scoped — not Super Admin." },
    ],
  },
  public: {
    eyebrow: "Share & guest reviews",
    panels: [
      { title: "Public profiles", body: "Optional share links without login for viewers." },
      { title: "Guest endorsements", body: "Human peer reviews via invite — not AI grading." },
      { title: "Visibility rules", body: "Some outcomes need approval before candidate sees them." },
    ],
  },
  realtime: {
    eyebrow: "Live updates",
    panels: [
      { title: "Queues", body: "Verification and assessment queues can refresh live." },
      { title: "Permissions", body: "Role and membership changes sync without reloads." },
      {
        title: "Notifications",
        body: "Notifications, permission changes, and queue refreshes reach every role without page reloads.",
      },
    ],
  },
  affiliate: {
    eyebrow: "Referrals ↔ affiliates",
    panels: [
      { title: "Candidate Refer & Earn", body: "Referral sharing from the candidate portal." },
      { title: "Super Admin affiliates", body: "Campaigns and reports under Affiliate Management." },
      { title: "Connection", body: "One referral program across roles, managed in Affiliate Management." },
    ],
  },
  support: {
    eyebrow: "Support & accountability",
    panels: [
      { title: "Raise Query", body: "In-app queries become tracked tickets." },
      { title: "Audit logs", body: "Operator-visible activity for governance." },
      {
        title: "Localization",
        body: "English-led, with i18n infrastructure and language preferences.",
      },
    ],
  },
  security: {
    eyebrow: "Account & tenant security",
    panels: [
      { title: "Company-scoped data", body: "Tenant boundaries for employer/verifier workspaces." },
      { title: "Self-serve signup", body: "Email verification for self-serve sign-ups." },
      {
        title: "Seats & deactivate",
        body: "Invited team seats and account self-deactivation keep access in the account owner's hands.",
      },
    ],
  },
};

const journey = [
  {
    id: "verify" as const,
    label: "1 · Verify",
    doNext: "See how one verification is reused across opportunities",
  },
  {
    id: "rubrics" as const,
    label: "2 · Rubrics",
    doNext: "See weighted criteria and performance levels",
  },
  {
    id: "checklists" as const,
    label: "3 · Checklists",
    doNext: "Review met / not-met gates and mandatory items",
  },
  {
    id: "approvals" as const,
    label: "4 · Approvals",
    doNext: "Separate assessment, media, and review-result gates",
  },
  {
    id: "permissions" as const,
    label: "5 · Permissions",
    doNext: "Workspace permissions and company team roles",
  },
  {
    id: "security" as const,
    label: "6 · Security",
    doNext: "Company-scoped data and account controls",
  },
];

export function TrustExplorer() {
  const [active, setActive] = useState<(typeof trustTopics)[number]["id"]>(
    trustTopics[0].id,
  );
  const { justHappened, activity, act } = useDemoActivity();
  const topic = trustTopics.find((t) => t.id === active) ?? trustTopics[0];
  const visual = visuals[active] ?? {
    eyebrow: "Overview",
    panels: [{ title: "Context", body: topic.body }],
  };

  const select = (id: (typeof trustTopics)[number]["id"], note?: string) => {
    setActive(id);
    if (note) act(note, false);
  };

  return (
    <div className="sp-panel overflow-hidden">
      <div className="border-b border-[var(--color-rule)] bg-inset px-4 py-3 sm:px-6">
        <p className="text-xs tracking-[0.16em] text-[var(--color-sky)] uppercase">
          Trust & governance explorer
        </p>
        <p className="mt-1 text-sm text-[var(--color-faint)]">
          How SkillPassport keeps verification, grading, approvals, and access accountable.
        </p>
        <DemoJourneyStrip
          steps={journey}
          activeId={journey.some((s) => s.id === active) ? active : null}
          justHappened={justHappened}
          activity={activity}
          overviewHint="Open any topic — suggested path is optional."
          ariaLabel="Trust topics"
          onSelect={(id) => select(id, `Opened “${journey.find((s) => s.id === id)?.label ?? id}”.`)}
        />
      </div>
      <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
        <ul className="divide-y divide-[var(--color-rule)] border-b border-[var(--color-rule)] lg:border-b-0 lg:border-r max-h-[70vh] overflow-y-auto">
          {trustTopics.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => select(item.id, `Opened “${item.title}”.`)}
                className={cx(
                  "w-full px-4 py-3.5 text-left text-sm transition sm:px-5",
                  active === item.id
                    ? "bg-white/[0.06] text-white"
                    : "text-[var(--color-muted)] hover:bg-white/[0.03]",
                )}
              >
                {item.title}
              </button>
            </li>
          ))}
        </ul>
        <div className="p-5 sm:p-6 space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-sky)]">
              {visual.eyebrow}
            </p>
            <h3 className="mt-2 text-2xl font-medium text-white">{topic.title}</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-muted)]">
              {topic.body}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {visual.panels.map((panel) => (
              <div
                key={panel.title}
                className="rounded-xl border border-[var(--color-rule)] bg-gradient-to-b from-white/[0.05] to-transparent p-4"
              >
                <p className="text-sm font-medium text-white">{panel.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                  {panel.body}
                </p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/verifiers/" className="text-[var(--color-sky)] hover:underline">
              Verifiers
            </Link>
            <Link href="/reviewers/" className="text-[var(--color-sky)] hover:underline">
              Reviewers
            </Link>
            <Link href="/enterprises/" className="text-[var(--color-sky)] hover:underline">
              Enterprises
            </Link>
            <Link href="/candidates/" className="text-[var(--color-sky)] hover:underline">
              Candidates
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
