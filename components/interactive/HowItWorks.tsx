"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { howItWorks } from "@/lib/content";
import { cx } from "@/lib/utils";

export function HowItWorks() {
  const [active, setActive] = useState(howItWorks[0].id);
  const reduce = useReducedMotion();
  const stage = howItWorks.find((s) => s.id === active) ?? howItWorks[0];
  const index = howItWorks.findIndex((s) => s.id === active);

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
      <ol className="flex flex-col gap-3" aria-label="How SkillPassport works">
        {howItWorks.map((step, i) => {
          const selected = step.id === active;
          return (
            <li key={step.id}>
              <button
                type="button"
                className={cx(
                  "group flex w-full items-start gap-4 rounded-2xl border px-4 py-4 text-left transition",
                  selected
                    ? "border-[var(--color-violet-line)] bg-white/6"
                    : "border-transparent bg-transparent hover:bg-white/4",
                )}
                aria-current={selected ? "step" : undefined}
                onClick={() => setActive(step.id)}
              >
                <span
                  className={cx(
                    "mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full border text-sm font-medium",
                    selected
                      ? "border-[var(--color-sky)] text-[var(--color-sky)]"
                      : "border-[var(--color-rule)] text-[var(--color-faint)]",
                  )}
                >
                  {step.label}
                </span>
                <span>
                  <span className="block text-lg font-medium text-white">{step.title}</span>
                  <span className="mt-1 block text-sm text-[var(--color-faint)]">
                    Overview {i + 1} · conceptual — not a required order
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="sp-panel relative overflow-hidden p-6 sm:p-8">
        <div
          className="mb-6 h-1.5 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={howItWorks.length}
          aria-valuenow={index + 1}
          aria-label="Overview progress"
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[var(--color-sky)] to-[var(--color-violet-hi)]"
            initial={false}
            animate={{ width: `${((index + 1) / howItWorks.length) * 100}%` }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={stage.id}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
          >
            <p className="sp-eyebrow mb-3">How it works</p>
            <h3 className="sp-heading text-3xl sm:text-4xl">{stage.title}</h3>
            <p className="mt-4 max-w-xl text-[var(--color-muted)] leading-relaxed">
              {stage.description}
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-3">
              {stage.outcomes.map((outcome) => (
                <li
                  key={outcome}
                  className="rounded-xl border border-[var(--color-rule)] bg-black/20 px-4 py-3 text-sm text-[var(--color-muted)]"
                >
                  {outcome}
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
