"use client";

import { ChevronRight } from "lucide-react";
import { cx } from "@/lib/utils";

export type DemoJourneyStep<T extends string = string> = {
  id: T;
  label: string;
  doNext: string;
};

type Props<T extends string> = {
  steps: ReadonlyArray<DemoJourneyStep<T>>;
  activeId: T | null;
  onSelect: (id: T) => void;
  /** What the user just did — mutations only, not the same as doNext */
  justHappened?: string | null;
  /** Short recent activity lines (newest first) */
  activity?: readonly string[];
  overviewHint?: string;
  ariaLabel?: string;
};

export function DemoJourneyStrip<T extends string>({
  steps,
  activeId,
  onSelect,
  justHappened,
  activity = [],
  overviewHint = "Overview open — pick any module below. Order is optional.",
  ariaLabel = "Demo modules",
}: Props<T>) {
  const index = steps.findIndex((s) => s.id === activeId);
  const current = index >= 0 ? steps[index] : null;
  const next = index >= 0 && index < steps.length - 1 ? steps[index + 1] : null;
  const recent = activity.slice(0, 4);

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs tracking-[0.14em] text-[var(--color-faint)] uppercase">
          Suggested path · jump any time
        </p>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto pb-1" aria-label={ariaLabel}>
        {steps.map((step, i) => (
          <div key={step.id} className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => onSelect(step.id)}
              className={cx(
                "rounded-xl border px-3.5 py-2.5 text-left text-xs font-medium transition",
                activeId === step.id
                  ? "border-[var(--color-sky)] bg-[rgb(16_113_250/0.15)] text-white"
                  : "border-[var(--color-rule)] text-[var(--color-muted)] hover:bg-white/[0.04]",
              )}
            >
              {step.label}
            </button>
            {i < steps.length - 1 ? (
              <ChevronRight
                className="mx-0.5 size-4 shrink-0 text-[var(--color-faint)]"
                aria-hidden
              />
            ) : null}
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl border border-[var(--color-rule)] bg-black/25 px-3 py-2.5">
          <p className="text-xs text-[var(--color-faint)]">
            {current ? "What you can do here" : "Where you are"}
          </p>
          <p className="mt-1 text-sm text-white">
            {current ? current.doNext : overviewHint}
          </p>
          {justHappened ? (
            <p className="mt-2 text-sm text-[var(--color-sky)]" role="status">
              Just now: {justHappened}
            </p>
          ) : null}
          {next ? (
            <button
              type="button"
              className="mt-2 inline-flex items-center gap-1 text-sm text-[var(--color-sky)] hover:underline"
              onClick={() => onSelect(next.id)}
            >
              Suggested next: {next.label}
              <ChevronRight className="size-4" aria-hidden />
            </button>
          ) : null}
        </div>

        <div className="rounded-xl border border-[var(--color-rule)] bg-black/20 px-3 py-2.5">
          <p className="text-xs text-[var(--color-faint)]">Recent activity</p>
          {recent.length ? (
            <ul className="mt-2 space-y-1.5">
              {recent.map((line, i) => (
                <li key={`${i}-${line}`} className="text-sm text-[var(--color-muted)]">
                  {line}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-[var(--color-faint)]">
              Actions you take here show up in this feed.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
