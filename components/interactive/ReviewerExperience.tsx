"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { DemoJourneyStrip } from "@/components/interactive/DemoJourneyStrip";
import {
  reviewerChecklistItems,
  reviewerImportSamples,
  reviewerLevelLabel,
  reviewerQueueSamples,
  reviewerRubricCriteria,
  type ReviewerQueueItem,
} from "@/data/reviewers";
import { useDemoActivity } from "@/hooks/useDemoActivity";
import { queueReviewApproval, readDemoBridge, type DemoMediaSubmission } from "@/lib/demo-bridge";
import { cx } from "@/lib/utils";

const tabs = [
  { id: "dashboard", label: "Dashboard" },
  { id: "queue", label: "Queues" },
  { id: "reviews", label: "My Reviews" },
  { id: "reporting", label: "Reporting" },
  { id: "media", label: "Media workspace" },
  { id: "rubric", label: "Rubric demo" },
  { id: "checklist", label: "Checklist demo" },
  { id: "ai", label: "AI import · builder" },
  { id: "resources", label: "Resources" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const journey = [
  { id: "queue" as const, label: "1 · Queues", doNext: "Filter Assessment / Media queue items and open a review" },
  { id: "reviews" as const, label: "2 · My Reviews", doNext: "Track in-review and completed work" },
  { id: "media" as const, label: "3 · Media", doNext: "Preview PDF / video / document workspace concepts" },
  { id: "rubric" as const, label: "4 · Rubric", doNext: "Score weighted criteria and submit grading" },
  { id: "ai" as const, label: "5 · AI import", doNext: "Import sample, generate a draft, refine in Form Builder, preview / publish" },
  { id: "resources" as const, label: "6 · Resources", doNext: "Good Practices, Guidelines, Help (not generative AI)" },
];

const INITIAL_SCORES: Record<string, number> = { accuracy: 3, solving: 4, comms: 2 };
const INITIAL_CHECKS: Record<string, boolean> = { c1: true, c2: false, c3: false, c4: false };

const mandatoryItems = reviewerChecklistItems.filter((i) => i.mandatory);

type MediaMode = "pdf" | "video" | "doc";

const mediaModeLabels: Record<MediaMode, string> = {
  pdf: "PDF annotation",
  video: "Video review",
  doc: "Document preview",
};

type GradingSummary = {
  kind: "rubric" | "checklist" | "media";
  rows: Array<{ label: string; value: string }>;
  total: string;
};

const resourceSections: Array<{
  title: string;
  body: string;
  cards?: Array<{ title: string; bullets: string[] }>;
}> = [
  {
    title: "Good Practices",
    body: "Curated guidance cards for reviewers. Static reference content — not generative AI.",
    cards: [
      {
        title: "Fair scoring",
        bullets: [
          "Score against the rubric descriptors, not against the previous submission you read.",
          "Use the full 0–5 range; do not cluster every score around 3 to avoid a decision.",
          "Re-check the weighted total before submitting — a single heavy criterion can swing it.",
        ],
      },
      {
        title: "Spotting and reducing bias",
        bullets: [
          "Judge the work, not the name, school, accent, or writing style of the candidate.",
          "Take a short break between long reviews; fatigue pushes scores towards the middle.",
          "If you know the candidate personally, flag it and hand the item back to the queue.",
        ],
      },
      {
        title: "Evidence over impression",
        bullets: [
          "Tie each score to something you can point at: a page, a timestamp, or a quoted line.",
          "Write the comment before choosing the final score so the reasoning drives the number.",
          "Mark missing evidence as “not evidenced” rather than guessing the candidate's intent.",
        ],
      },
    ],
  },
  {
    title: "Guidelines",
    body: "Operating guidelines for rubrics, checklists, and evidence handling.",
    cards: [
      {
        title: "Rubrics and weights",
        bullets: [
          "Do not change weights mid-review; raise a form change request instead.",
          "Every criterion needs a score, even if that score is 0 with a note explaining why.",
        ],
      },
      {
        title: "Checklists and mandatory items",
        bullets: [
          "Submission is blocked until every mandatory item is met — do not tick items to unblock.",
          "Optional items inform feedback but never lower a pass on their own.",
        ],
      },
      {
        title: "Evidence handling and approvals",
        bullets: [
          "Treat candidate files as confidential and keep notes inside the review tool.",
          "Tick “Requires admin approval” when the result will be shown to a candidate or employer.",
          "Approved results are final; corrections go through the admin queue.",
        ],
      },
    ],
  },
  {
    title: "Help Center",
    body: "Help topics for forms library, queues, My Reviews, reporting, and media review.",
  },
  {
    title: "PDF / video / document review",
    body: "Product workspaces support annotation, video evidence, and document preview — explained here; not a live media player on this site.",
  },
  {
    title: "Forms library & publishing",
    body: "Manual rubric/checklist creation, preview, draft, and publish concepts. AI Form Builder refines imports — it is not a chatbot.",
  },
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
  return JSON.stringify({ name: bridge.candidateName, media: bridge.mediaSubmissions });
}

function getBridgeServerSnapshot() {
  return JSON.stringify({ name: "Aarav Sharma", media: [] });
}

const bridgeMediaState: Record<DemoMediaSubmission["state"], ReviewerQueueItem["state"]> = {
  Submitted: "Queued",
  "In review": "In review",
  Completed: "Completed",
};

export function ReviewerExperience() {
  const [tab, setTab] = useState<TabId>("dashboard");
  const { justHappened, activity, act } = useDemoActivity();
  const [mediaMode, setMediaMode] = useState<MediaMode>("pdf");
  const [mediaNotes, setMediaNotes] = useState<Record<MediaMode, string>>({
    pdf: "",
    video: "",
    doc: "",
  });
  const [summaries, setSummaries] = useState<Record<string, GradingSummary>>({});
  const [publishState, setPublishState] = useState<"draft" | "preview" | "published">("draft");
  const [scores, setScores] = useState<Record<string, number>>({ ...INITIAL_SCORES });
  const [checks, setChecks] = useState<Record<string, boolean>>({ ...INITIAL_CHECKS });
  const [importId, setImportId] = useState<string>(reviewerImportSamples[0].id);
  const [generated, setGenerated] = useState(false);
  const [context, setContext] = useState("Prefer four performance levels; keep weights explicit.");
  const [builderTitle, setBuilderTitle] = useState(`${reviewerImportSamples[0].classification} draft`);
  const [sections, setSections] = useState<string[]>([...reviewerImportSamples[0].sections]);
  const [queueFilter, setQueueFilter] = useState<"All" | "Assessment" | "Media">("All");
  const [queue, setQueue] = useState<ReviewerQueueItem[]>(() =>
    reviewerQueueSamples.map((q) => ({ ...q })),
  );
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [needsAdmin, setNeedsAdmin] = useState(true);

  const bridgeRaw = useSyncExternalStore(
    subscribeBridge,
    getBridgeSnapshot,
    getBridgeServerSnapshot,
  );

  // Pull candidate-demo media submissions into the queue as extra media items.
  useEffect(() => {
    const bridge = JSON.parse(bridgeRaw) as { name: string; media: DemoMediaSubmission[] };
    if (!bridge.media.length) return;
    setQueue((prev) => {
      const additions: ReviewerQueueItem[] = bridge.media
        .filter((m) => !prev.some((q) => q.id === `bridge-${m.id}`))
        .map((m) => ({
          id: `bridge-${m.id}`,
          title: `${m.title} (${m.kind}) — ${bridge.name}`,
          type: "Media" as const,
          state: bridgeMediaState[m.state],
        }));
      return additions.length ? [...prev, ...additions] : prev;
    });
  }, [bridgeRaw]);

  const weighted = useMemo(() => {
    const total = reviewerRubricCriteria.reduce((sum, c) => {
      const score = scores[c.id] ?? 0;
      return sum + (score / c.max) * c.weight;
    }, 0);
    return Math.round(total);
  }, [scores]);

  const checklistProgress = useMemo(() => {
    const done = reviewerChecklistItems.filter((i) => checks[i.id]).length;
    return {
      done,
      total: reviewerChecklistItems.length,
      pct: Math.round((done / reviewerChecklistItems.length) * 100),
    };
  }, [checks]);

  const missingMandatory = useMemo(
    () => mandatoryItems.filter((i) => !checks[i.id]),
    [checks],
  );

  const queueCounts = useMemo(
    () => ({
      queued: queue.filter((q) => q.state === "Queued").length,
      inReview: queue.filter((q) => q.state === "In review").length,
      completed: queue.filter((q) => q.state === "Completed").length,
      pendingAdmin: queue.filter((q) => q.pendingAdmin).length,
      media: queue.filter((q) => q.type === "Media").length,
    }),
    [queue],
  );

  const reviewing = queue.find((q) => q.id === reviewingId) ?? null;
  const imported = reviewerImportSamples.find((s) => s.id === importId) ?? reviewerImportSamples[0];
  const visibleQueue = queue.filter((q) => queueFilter === "All" || q.type === queueFilter);

  const moveSection = (index: number, dir: -1 | 1) => {
    setSections((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    act(`Moved section “${sections[index]}” ${dir === -1 ? "up" : "down"}`);
  };

  const go = (next: TabId) => setTab(next);

  const openReview = (item: ReviewerQueueItem) => {
    if (reviewingId !== item.id) {
      setScores({ ...INITIAL_SCORES });
      setChecks({ ...INITIAL_CHECKS });
    }
    setReviewingId(item.id);
    if (item.state === "Queued") {
      setQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, state: "In review" } : q)),
      );
    }
    act(
      item.state === "Queued"
        ? `Opened review: ${item.title} (Queued → In review)`
        : `Resumed review: ${item.title}`,
    );
    go(item.type === "Media" ? "media" : "rubric");
  };

  const submitGrading = (kind: "rubric" | "checklist" | "media") => {
    if (!reviewing) return;
    if (kind === "checklist" && missingMandatory.length) return;
    const result =
      kind === "rubric"
        ? `Rubric ${weighted}%`
        : kind === "checklist"
          ? `Checklist ${checklistProgress.pct}%`
          : "Media review noted";
    setQueue((prev) =>
      prev.map((q) =>
        q.id === reviewing.id
          ? { ...q, state: "Completed", pendingAdmin: needsAdmin, result }
          : q,
      ),
    );
    const summary: GradingSummary =
      kind === "rubric"
        ? {
            kind,
            rows: reviewerRubricCriteria.map((c) => {
              const score = scores[c.id] ?? 0;
              const points = Math.round((score / c.max) * c.weight * 10) / 10;
              return {
                label: c.label,
                value: `${score}/${c.max} · ${reviewerLevelLabel(score)} · ${points} of ${c.weight}%`,
              };
            }),
            total: `Weighted total ${weighted}%`,
          }
        : kind === "checklist"
          ? {
              kind,
              rows: reviewerChecklistItems.map((i) => ({
                label: i.label,
                value: checks[i.id] ? "Met" : "Not met",
              })),
              total: `Checklist ${checklistProgress.pct}% (${checklistProgress.done} of ${checklistProgress.total})`,
            }
          : {
              kind,
              rows: (Object.keys(mediaModeLabels) as MediaMode[]).map((m) => ({
                label: `${mediaModeLabels[m]} notes`,
                value: mediaNotes[m].trim() || "No notes",
              })),
              total: "Media review noted",
            };
    setSummaries((prev) => ({ ...prev, [reviewing.id]: summary }));
    setReviewingId(null);
    if (needsAdmin) {
      queueReviewApproval({ title: reviewing.title, source: reviewing.id });
    }
    act(
      `Submitted grading for ${reviewing.title} — ${result}${
        needsAdmin ? " (pending admin approval)" : ""
      }`,
      !needsAdmin,
    );
    go("reviews");
  };

  const reviewingBanner = (
    <div
      className={cx(
        "rounded-xl border px-4 py-2.5 text-sm",
        reviewing
          ? "border-[var(--color-sky)]/40 bg-[rgb(16_113_250/0.08)] text-white"
          : "border-dashed border-[var(--color-rule)] text-[var(--color-faint)]",
      )}
    >
      {reviewing ? (
        <>Reviewing: {reviewing.title}</>
      ) : (
        <>
          No review open. Choose “Open review” in{" "}
          <button
            type="button"
            className="text-[var(--color-sky)] hover:underline"
            onClick={() => go("queue")}
          >
            Queues
          </button>{" "}
          to attach this work to an item.
        </>
      )}
    </div>
  );

  const submitBar = (kind: "rubric" | "checklist" | "media") => {
    const blocked = kind === "checklist" && missingMandatory.length > 0;
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--color-rule)] bg-black/20 p-4">
        <button
          type="button"
          className="sp-btn-primary disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!reviewing || blocked}
          onClick={() => submitGrading(kind)}
        >
          Submit grading
        </button>
        <label className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
          <input
            type="checkbox"
            checked={needsAdmin}
            onChange={(e) => setNeedsAdmin(e.target.checked)}
          />
          Requires admin approval
        </label>
        {!reviewing ? (
          <p className="text-xs text-[var(--color-faint)]">Open a review from Queues to submit.</p>
        ) : null}
      </div>
    );
  };

  return (
    <div className="sp-panel overflow-hidden">
      <div className="border-b border-[var(--color-rule)] bg-black/20 px-4 py-3 sm:px-6">
        <p className="text-xs tracking-[0.16em] text-[var(--color-sky)] uppercase">
          Reviewer workspace preview
        </p>
        <p className="mt-1 text-sm text-[var(--color-faint)]">
          Open a review, score it, then submit. Modules can be used in any order, and everything
          stays in this session.
        </p>
        <DemoJourneyStrip
          steps={journey}
          activeId={journey.some((s) => s.id === tab) ? (tab as (typeof journey)[number]["id"]) : null}
          justHappened={justHappened}
          activity={activity}
          ariaLabel="Reviewer journey"
          onSelect={(id) => go(id)}
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
            onClick={() => go(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="p-5 sm:p-6" role="tabpanel">
        {tab === "dashboard" && (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {[
                { label: "Queued", value: String(queueCounts.queued) },
                { label: "In review", value: String(queueCounts.inReview) },
                { label: "Completed", value: String(queueCounts.completed) },
                { label: "Pending admin", value: String(queueCounts.pendingAdmin) },
                { label: "Form draft state", value: publishState },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl border border-[var(--color-rule)] bg-white/[0.03] p-4"
                >
                  <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-faint)]">
                    {card.label}
                  </p>
                  <p className="mt-2 text-xl font-medium capitalize text-white">{card.value}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-[var(--color-muted)]">
              Overview of queues, My Reviews, reporting, forms library paths (manual + AI import),
              and media review. Counts above follow your actions. Jump into a module below.
            </p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["queue", "Queues"],
                  ["reviews", "My Reviews"],
                  ["reporting", "Reporting"],
                  ["media", "Media"],
                  ["ai", "AI import"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className="rounded-lg bg-white/5 px-3 py-2 text-sm text-[var(--color-muted)]"
                  onClick={() => go(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "queue" && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(["All", "Assessment", "Media"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setQueueFilter(f)}
                  className={cx(
                    "rounded-full border px-3 py-1.5 text-sm",
                    queueFilter === f
                      ? "border-[var(--color-sky)] text-white bg-[rgb(16_113_250/0.15)]"
                      : "border-[var(--color-rule)] text-[var(--color-muted)]",
                  )}
                >
                  {f === "All" ? "All queues" : `${f} queue`}
                </button>
              ))}
            </div>
            <ul className="space-y-2">
              {visibleQueue.map((item) => (
                <li
                  key={item.id}
                  className={cx(
                    "flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-white/[0.03] px-4 py-3",
                    reviewingId === item.id
                      ? "border-[var(--color-sky)]/50"
                      : "border-[var(--color-rule)]",
                  )}
                >
                  <div>
                    <p className="text-white">{item.title}</p>
                    <p className="text-sm text-[var(--color-faint)]">{item.type}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {item.pendingAdmin ? (
                      <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-xs text-amber-200">
                        Pending admin approval
                      </span>
                    ) : null}
                    <span className="text-xs text-[var(--color-sky)]">{item.state}</span>
                    {item.state !== "Completed" ? (
                      <button
                        type="button"
                        className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white"
                        onClick={() => openReview(item)}
                      >
                        {reviewingId === item.id ? "Continue review" : "Open review"}
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
              {visibleQueue.length === 0 ? (
                <li className="text-sm text-[var(--color-faint)]">No items in this queue.</li>
              ) : null}
            </ul>
          </div>
        )}

        {tab === "reviews" && (
          <div className="space-y-3">
            {queue
              .filter((q) => q.state === "Completed" || q.state === "In review")
              .map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-[var(--color-rule)] bg-white/[0.03] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-white">{item.title}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {item.pendingAdmin ? (
                        <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-xs text-amber-200">
                          Pending admin approval
                        </span>
                      ) : null}
                      <span className="text-xs text-[var(--color-sky)]">{item.state}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    {item.state === "Completed"
                      ? `Submitted${item.result ? ` · ${item.result}` : ""}.`
                      : "Grading in progress — continue to score and submit."}
                  </p>
                  {item.state === "Completed" && summaries[item.id] ? (
                    <div className="mt-3 rounded-lg bg-black/25 p-3">
                      <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-sky)]">
                        Grading summary
                      </p>
                      <ul className="mt-2 space-y-1 text-sm">
                        {summaries[item.id].rows.map((row) => (
                          <li key={row.label} className="flex flex-wrap justify-between gap-2">
                            <span className="text-[var(--color-muted)]">{row.label}</span>
                            <span className="text-white">{row.value}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 border-t border-[var(--color-rule)] pt-2 text-sm font-medium text-white">
                        {summaries[item.id].total}
                      </p>
                    </div>
                  ) : null}
                  {item.state === "In review" ? (
                    <button
                      type="button"
                      className="mt-3 inline-flex items-center gap-1 text-sm text-[var(--color-sky)] hover:underline"
                      onClick={() => openReview(item)}
                    >
                      Continue review
                    </button>
                  ) : null}
                </div>
              ))}
            {queueCounts.inReview + queueCounts.completed === 0 ? (
              <p className="text-sm text-[var(--color-faint)]">
                Nothing here yet. Open a review from Queues.
              </p>
            ) : null}
          </div>
        )}

        {tab === "reporting" && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Reviews completed", value: String(queueCounts.completed) },
                { label: "Pending admin approval", value: String(queueCounts.pendingAdmin) },
                { label: "Media items", value: String(queueCounts.media) },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl border border-[var(--color-rule)] bg-white/[0.03] p-4"
                >
                  <p className="text-xs text-[var(--color-faint)]">{card.label}</p>
                  <p className="mt-2 text-2xl text-white">{card.value}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-[var(--color-muted)]">
              Reporting preview for reviewer workload, counted from the {queue.length} items in your
              queue. These are not SkillPassport performance metrics.
            </p>
          </div>
        )}

        {tab === "media" && (
          <div className="space-y-4">
            {reviewingBanner}
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["pdf", "PDF annotation"],
                  ["video", "Video review"],
                  ["doc", "Document preview"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setMediaMode(id);
                    act(`Switched media workspace to ${label}`);
                  }}
                  className={cx(
                    "rounded-full border px-3 py-1.5 text-sm",
                    mediaMode === id
                      ? "border-[var(--color-sky)] text-white bg-[rgb(16_113_250/0.15)]"
                      : "border-[var(--color-rule)] text-[var(--color-muted)]",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="rounded-xl border border-[var(--color-rule)] bg-gradient-to-br from-black/40 to-[rgb(82_36_212/0.15)] p-6 min-h-[200px]">
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-sky)]">
                {mediaMode === "pdf"
                  ? "PDF workspace (illustrative)"
                  : mediaMode === "video"
                    ? "Video workspace (illustrative)"
                    : "Document workspace (illustrative)"}
              </p>
              <div className="mt-6 space-y-3">
                <div className="h-3 w-[80%] rounded bg-white/10" />
                <div className="h-3 w-[60%] rounded bg-white/10" />
                <div className="h-24 rounded-lg border border-dashed border-white/20 bg-black/20 flex items-center justify-center text-sm text-[var(--color-faint)]">
                  {mediaMode === "pdf"
                    ? "Annotation markers · page preview (static)"
                    : mediaMode === "video"
                      ? "Timeline · evidence notes (static)"
                      : "Document preview pane (static)"}
                </div>
              </div>
              <p className="mt-4 text-sm text-[var(--color-muted)]">
                Explains the product media review concept. This site does not analyze uploaded
                files.
              </p>
            </div>
            <label className="block text-sm text-[#bdb4ff]">
              Reviewer notes — {mediaModeLabels[mediaMode]}
              <textarea
                rows={4}
                value={mediaNotes[mediaMode]}
                onChange={(e) =>
                  setMediaNotes((prev) => ({ ...prev, [mediaMode]: e.target.value }))
                }
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    act(`Saved ${mediaModeLabels[mediaMode]} notes (local)`);
                  }
                }}
                placeholder="Timestamps, page references, evidence observations…"
                className="mt-2 w-full rounded-xl border border-[var(--color-rule)] bg-[#05071c] px-4 py-3 text-white outline-none focus:border-[var(--color-sky)]"
              />
              <span className="mt-1 block text-xs text-[var(--color-faint)]">
                Notes are kept per mode while you switch between PDF, video, and document.
              </span>
            </label>
            {submitBar("media")}
          </div>
        )}

        {tab === "rubric" && (
          <div className="space-y-4">
            {reviewingBanner}
            <p className="text-xs text-[var(--color-faint)]">
              Levels: 0 Not evidenced · 1–2 Emerging · 3–4 Proficient · 5 Strong
            </p>
            {reviewerRubricCriteria.map((c) => (
              <div key={c.id} className="rounded-xl border border-[var(--color-rule)] bg-white/[0.03] p-4">
                <div className="flex flex-wrap justify-between gap-2">
                  <p className="text-white">{c.label}</p>
                  <p className="text-sm text-[var(--color-sky)]">
                    {c.weight}% weight · {scores[c.id]}/{c.max} · {reviewerLevelLabel(scores[c.id])}
                  </p>
                </div>
                <input
                  type="range"
                  min={0}
                  max={c.max}
                  value={scores[c.id]}
                  onChange={(e) =>
                    setScores((prev) => ({ ...prev, [c.id]: Number(e.target.value) }))
                  }
                  onPointerUp={(e) =>
                    act(
                      `Scored ${c.label}: ${e.currentTarget.value}/${c.max} (${reviewerLevelLabel(
                        Number(e.currentTarget.value),
                      )})`,
                    )
                  }
                  onKeyUp={(e) =>
                    act(
                      `Scored ${c.label}: ${e.currentTarget.value}/${c.max} (${reviewerLevelLabel(
                        Number(e.currentTarget.value),
                      )})`,
                    )
                  }
                  className="mt-3 w-full"
                  aria-label={`${c.label} score`}
                  aria-valuetext={`${scores[c.id]} of ${c.max}, ${reviewerLevelLabel(scores[c.id])}`}
                />
                <div className="mt-1 flex justify-between text-[10px] text-[var(--color-faint)]">
                  {Array.from({ length: c.max + 1 }, (_, n) => (
                    <span key={n}>{n}</span>
                  ))}
                </div>
              </div>
            ))}
            <div className="rounded-xl border border-[var(--color-sky)]/30 bg-[rgb(16_113_250/0.08)] p-4">
              <p className="text-sm text-[var(--color-faint)]">Weighted score</p>
              <p className="mt-1 text-3xl font-medium text-white">{weighted}%</p>
            </div>
            {submitBar("rubric")}
          </div>
        )}

        {tab === "checklist" && (
          <div className="space-y-4">
            {reviewingBanner}
            <ul className="space-y-2">
              {reviewerChecklistItems.map((item) => (
                <li key={item.id}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--color-rule)] bg-white/[0.03] px-4 py-3">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={Boolean(checks[item.id])}
                      onChange={(e) => {
                        setChecks((prev) => ({ ...prev, [item.id]: e.target.checked }));
                        act(`${e.target.checked ? "Checked" : "Unchecked"}: ${item.label}`);
                      }}
                    />
                    <span className="text-white">
                      {item.label}
                      {item.mandatory ? (
                        <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--color-sky)]">
                          Mandatory
                        </span>
                      ) : (
                        <span className="ml-2 text-[10px] uppercase tracking-wide text-[var(--color-faint)]">
                          Optional
                        </span>
                      )}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <div className="rounded-xl border border-[var(--color-rule)] bg-black/20 p-4">
              <p className="text-sm text-[var(--color-muted)]">
                Checklist progress: {checklistProgress.done} of {checklistProgress.total} criteria met
              </p>
              <p className="mt-2 text-3xl text-white">{checklistProgress.pct}%</p>
              {missingMandatory.length ? (
                <p className="mt-2 text-sm text-amber-200" role="alert">
                  Submission blocked: complete {missingMandatory.length} mandatory item
                  {missingMandatory.length === 1 ? "" : "s"} first —{" "}
                  {missingMandatory.map((i) => i.label).join("; ")}.
                </p>
              ) : (
                <p className="mt-2 text-sm text-[var(--color-sky)]">
                  All mandatory items complete — ready to submit.
                </p>
              )}
            </div>
            {submitBar("checklist")}
          </div>
        )}

        {tab === "ai" && (
          <div className="space-y-5">
            <p className="text-sm text-[var(--color-muted)]">
              Documented path: upload PDF/Word/text/Markdown, auto-classify rubric vs checklist,
              optional context, draft, refine in AI Form Builder (not a chatbot).
            </p>
            <div className="flex flex-wrap gap-2">
              {reviewerImportSamples.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => {
                    setImportId(sample.id);
                    setBuilderTitle(`${sample.classification} draft`);
                    setSections([...sample.sections]);
                    setGenerated(false);
                    setPublishState("draft");
                    act(`Imported ${sample.label} — classified as ${sample.classification}`);
                  }}
                  className={cx(
                    "rounded-full border px-3 py-1.5 text-sm",
                    importId === sample.id
                      ? "border-[var(--color-sky)] text-white bg-[rgb(16_113_250/0.15)]"
                      : "border-[var(--color-rule)] text-[var(--color-muted)]",
                  )}
                >
                  {sample.label}
                </button>
              ))}
            </div>
            <label className="block text-sm text-[#bdb4ff]">
              Optional context for AI
              <textarea
                rows={2}
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[var(--color-rule)] bg-[#05071c] px-4 py-3 text-white outline-none focus:border-[var(--color-sky)]"
              />
            </label>
            <div className="rounded-xl border border-[var(--color-rule)] bg-black/20 p-4 text-sm text-[var(--color-muted)] space-y-3">
              <p>
                Classification: <span className="text-white">{imported.classification}</span>
              </p>
              <button
                type="button"
                className="sp-btn-primary"
                onClick={() => {
                  setGenerated(true);
                  setSections([...imported.sections]);
                  setBuilderTitle(`${imported.classification} draft`);
                  setPublishState("draft");
                  act(`Generated ${imported.classification.toLowerCase()} draft from ${imported.label}`);
                }}
              >
                {generated ? "Regenerate draft" : "Generate draft"}
              </button>
              {generated ? (
                <>
                  <pre className="whitespace-pre-wrap text-[var(--color-faint)]">{imported.draft}</pre>
                  <p className="text-xs">Context applied locally: {context}</p>
                </>
              ) : (
                <p className="text-xs text-[var(--color-faint)]">
                  Choose a sample, then generate a draft to fill the builder below.
                </p>
              )}
            </div>
            <div className="rounded-xl border border-[var(--color-rule)] bg-white/[0.03] p-4 space-y-3">
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-sky)]">
                AI Form Builder (refinement) · {imported.classification}
              </p>
              <input
                value={builderTitle}
                onChange={(e) => setBuilderTitle(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-rule)] bg-[#05071c] px-4 py-3 text-white outline-none focus:border-[var(--color-sky)]"
                aria-label="Draft form title"
              />
              <ul className="space-y-2">
                {sections.map((section, index) => (
                  <li
                    key={section}
                    className="flex items-center justify-between gap-2 rounded-lg bg-black/25 px-3 py-2"
                  >
                    <span className="text-sm text-white">{section}</span>
                    <span className="flex gap-1">
                      <button
                        type="button"
                        className="rounded bg-white/10 px-2 py-1 text-xs text-white"
                        onClick={() => moveSection(index, -1)}
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        className="rounded bg-white/10 px-2 py-1 text-xs text-white"
                        onClick={() => moveSection(index, 1)}
                      >
                        Down
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                {(["draft", "preview", "published"] as const).map((state) => (
                  <button
                    key={state}
                    type="button"
                    disabled={state !== "draft" && !generated}
                    onClick={() => {
                      setPublishState(state);
                      act(
                        state === "published"
                          ? `Published “${builderTitle}” (local)`
                          : state === "preview"
                            ? `Previewing “${builderTitle}”`
                            : `Returned “${builderTitle}” to draft`,
                      );
                    }}
                    className={cx(
                      "rounded-lg px-3 py-1.5 text-xs capitalize disabled:cursor-not-allowed disabled:opacity-40",
                      publishState === state
                        ? "bg-[var(--color-violet-hi)] text-white"
                        : "bg-white/10 text-[var(--color-muted)]",
                    )}
                  >
                    {state === "published" ? "Publish" : state}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[var(--color-faint)]">
                Form state: <span className="text-white">{publishState}</span>
                {generated ? "" : " — generate a draft to enable preview and publish"}. Local only,
                not a live catalog publish.
              </p>

              {publishState === "preview" ? (
                <div className="rounded-xl border border-[var(--color-sky)]/30 bg-[rgb(16_113_250/0.06)] p-4 space-y-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-sky)]">
                    Form preview
                  </p>
                  <h4 className="text-lg text-white">{builderTitle || "Untitled form"}</h4>
                  {sections.map((section) => (
                    <div key={section} className="rounded-lg bg-black/25 p-3">
                      <p className="text-sm font-medium text-white">{section}</p>
                      {imported.classification === "Rubric" &&
                      section.toLowerCase().startsWith("criteria") ? (
                        <ul className="mt-2 space-y-1 text-sm text-[var(--color-muted)]">
                          {reviewerRubricCriteria.map((c) => (
                            <li key={c.id} className="flex justify-between gap-2">
                              <span>{c.label}</span>
                              <span className="text-[var(--color-faint)]">
                                {c.weight}% · 0–{c.max}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : imported.classification === "Checklist" &&
                        section.toLowerCase().includes("items") ? (
                        <ul className="mt-2 space-y-1 text-sm text-[var(--color-muted)]">
                          {reviewerChecklistItems
                            .filter((i) =>
                              section.toLowerCase().startsWith("required")
                                ? i.mandatory
                                : !i.mandatory,
                            )
                            .map((i) => (
                              <li key={i.id} className="flex items-center gap-2">
                                <input type="checkbox" disabled aria-hidden tabIndex={-1} />
                                {i.label}
                              </li>
                            ))}
                        </ul>
                      ) : (
                        <div className="mt-2 h-10 rounded-md border border-dashed border-white/20 bg-black/20" />
                      )}
                    </div>
                  ))}
                </div>
              ) : null}
              {publishState === "published" ? (
                <p className="rounded-lg bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200" role="status">
                  “{builderTitle}” is marked published in this session.
                </p>
              ) : null}
            </div>
            <p className="text-sm text-[var(--color-faint)]">
              Related:{" "}
              <Link href="/ai/" className="text-[var(--color-sky)] hover:underline">
                AI page
              </Link>{" "}
              ·{" "}
              <Link href="/candidates/" className="text-[var(--color-sky)] hover:underline">
                Candidates
              </Link>
            </p>
          </div>
        )}

        {tab === "resources" && (
          <div className="space-y-4">
            {resourceSections.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-[var(--color-rule)] bg-white/[0.03] p-4"
              >
                <h3 className="font-medium text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-[var(--color-muted)]">{item.body}</p>
                {item.cards ? (
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    {item.cards.map((card) => (
                      <div key={card.title} className="rounded-lg bg-black/25 p-3">
                        <p className="text-sm font-medium text-white">{card.title}</p>
                        <ul className="mt-2 list-disc space-y-1.5 pl-4 text-sm text-[var(--color-muted)]">
                          {card.bullets.map((b) => (
                            <li key={b}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
