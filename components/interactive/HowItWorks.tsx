"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Link2,
  Pencil,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  Workflow,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { TravelPulse } from "@/components/ui/TravelPulse";
import { howItWorks } from "@/lib/content";
import { cx } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const floatIcons = [FileText, GraduationCap, BarChart3] as const;

const stepIcons = [
  UserRound,
  ShieldCheck,
  ClipboardCheck,
  Link2,
  Users,
  Workflow,
  Sparkles,
] as const;

const stepHints = [
  "Candidates build the profile.",
  "Verifier companies check documents.",
  "Candidates take assessments.",
  "Employers run hiring.",
  "Reviewers grade submissions.",
  "Admins approve and govern.",
  "Every role stays in sync.",
] as const;

/** Measured geometry of the step rail: x of the circles' centre line and each circle's centre y (px, relative to the list). */
type Rail = { x: number; centers: number[] };

export function HowItWorks() {
  const [active, setActive] = useState(howItWorks[0].id);
  const reduce = usePrefersReducedMotion();
  const index = howItWorks.findIndex((s) => s.id === active);
  const stage = howItWorks[index] ?? howItWorks[0];

  const listRef = useRef<HTMLOListElement>(null);
  const circleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [rail, setRail] = useState<Rail | null>(null);

  // Measure circle centres so the connector runs exactly through their middles at every breakpoint.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const box = list.getBoundingClientRect();
      const circles = circleRefs.current.filter((el): el is HTMLSpanElement => el !== null);
      if (circles.length < 2) return;
      const first = circles[0].getBoundingClientRect();
      const x = Math.round((first.left + first.width / 2 - box.left) * 2) / 2;
      const centers = circles.map((el) => {
        const r = el.getBoundingClientRect();
        return Math.round((r.top + r.height / 2 - box.top) * 2) / 2;
      });
      setRail((prev) =>
        prev && prev.x === x && prev.centers.join() === centers.join() ? prev : { x, centers },
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    circleRefs.current.forEach((el) => el && ro.observe(el));
    document.fonts?.ready.then(measure).catch(() => {});
    return () => ro.disconnect();
  }, []);

  const railTop = rail?.centers[0] ?? 0;
  const railEnd = rail?.centers[rail.centers.length - 1] ?? 0;
  const fill = rail ? (rail.centers[index] ?? railTop) - railTop : 0;

  const go = (next: number) => {
    const safe = Math.max(0, Math.min(howItWorks.length - 1, next));
    setActive(howItWorks[safe].id);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.15fr] lg:gap-8">
      <ol ref={listRef} className="relative flex flex-col gap-2" aria-label="How SkillPassport works">
        {rail && (
          <>
            {/* Track: centre of circle 01 → centre of circle 07, behind the solid circles */}
            <span
              className="pointer-events-none absolute w-px rounded-full bg-[rgb(106_70_232/0.32)]"
              style={{ left: rail.x - 0.5, top: railTop, height: railEnd - railTop }}
              aria-hidden
            />
            {/* Progress: grows down to the active step's centre */}
            <motion.span
              className="pointer-events-none absolute w-[2px] rounded-full bg-gradient-to-b from-[var(--color-sky)] to-[var(--color-violet-hi)] shadow-[0_0_10px_rgb(98_172_250/0.55)]"
              style={{ left: rail.x - 1, top: railTop }}
              initial={false}
              animate={{ height: fill }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 24 }}
              aria-hidden
            />
            {/* Travelling glow along the filled part (motion only) */}
            {!reduce && fill > 0 && (
              <motion.span
                key={`pulse-${index}`}
                className="pointer-events-none absolute size-2 rounded-full bg-white shadow-[0_0_10px_3px_rgb(98_172_250/0.7)]"
                style={{ left: rail.x - 4, top: railTop - 4 }}
                initial={{ y: 0, opacity: 0 }}
                animate={{ y: [0, fill], opacity: [0, 1, 1, 0] }}
                transition={{
                  duration: Math.min(2.4, 0.9 + fill / 300),
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 0.5,
                  delay: 0.45,
                }}
                aria-hidden
              />
            )}
          </>
        )}
        {howItWorks.map((step, i) => {
          const selected = step.id === active;
          const reached = i < index;
          const Icon = stepIcons[i] ?? UserRound;
          return (
            <li key={step.id}>
              <button
                type="button"
                className={cx(
                  "group relative flex w-full items-start gap-3 rounded-2xl border px-3 py-3.5 text-left transition sm:gap-4 sm:px-4",
                  selected
                    ? "sp-glass-active border-[var(--color-violet-line)] bg-[linear-gradient(135deg,rgb(82_36_212/0.28),rgb(16_113_250/0.08))]"
                    : "border-transparent bg-transparent hover:border-[var(--color-rule)] hover:bg-white/[0.03]",
                )}
                aria-current={selected ? "step" : undefined}
                onClick={() => setActive(step.id)}
              >
                <span
                  ref={(el) => {
                    circleRefs.current[i] = el;
                  }}
                  className={cx(
                    "relative z-[1] mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full border text-sm font-medium transition-[border-color,color,box-shadow] duration-300",
                    selected
                      ? "border-[var(--color-sky)] bg-[#0b1040] text-[var(--color-sky)] shadow-[0_0_18px_rgb(98_172_250/0.35)]"
                      : reached
                        ? "border-[rgb(98_172_250/0.55)] bg-[var(--color-ink)] text-[rgb(98_172_250/0.85)]"
                        : "border-[var(--color-rule)] bg-[var(--color-ink)] text-[var(--color-faint)]",
                  )}
                >
                  {step.label}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <Icon
                      className={cx(
                        "size-4 shrink-0",
                        selected ? "text-[var(--color-sky)]" : "text-[var(--color-faint)]",
                      )}
                      aria-hidden
                    />
                    <span className="block text-base font-medium text-white sm:text-lg">
                      {step.title}
                    </span>
                  </span>
                  <span className="mt-1 block text-sm text-[var(--color-faint)]">
                    {stepHints[i]}
                  </span>
                </span>
                <ChevronRight
                  className={cx(
                    "mt-2 size-4 shrink-0 transition",
                    selected ? "text-[var(--color-sky)]" : "text-white/20 group-hover:text-white/40",
                  )}
                  aria-hidden
                />
              </button>
            </li>
          );
        })}
      </ol>

      <div className="sp-glass relative overflow-hidden p-6 sm:p-8">
        <div
          className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-[rgb(106_70_232/0.22)] blur-3xl"
          aria-hidden
        />
        <div className="mb-5 flex items-center gap-3">
          <span className="h-1 w-8 rounded-full bg-[var(--color-violet-hi)]" aria-hidden />
          <p className="text-xs font-medium tracking-[0.16em] text-[var(--color-sky)] uppercase">
            Step {stage.label} of {String(howItWorks.length).padStart(2, "0")}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={stage.id}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
          >
            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <h3 className="sp-heading text-3xl sm:text-4xl">{stage.title}</h3>
                <p className="mt-3 max-w-xl text-[var(--color-muted)] leading-relaxed">
                  {stage.description}
                </p>
                <ul className="mt-5 space-y-2.5">
                  {stage.outcomes.map((outcome) => (
                    <li
                      key={outcome}
                      className="flex items-center gap-3 rounded-xl border border-[var(--color-rule)] bg-inset px-3.5 py-3 text-[15px] leading-snug text-[var(--color-muted)]"
                    >
                      <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-md bg-[rgb(98_172_250/0.15)] text-[var(--color-sky)]">
                        <Check className="size-3.5" aria-hidden />
                      </span>
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Inclined My Profile — 3 beams from icons, stop at card LEFT EDGE only */}
              <div
                className="relative mx-auto h-[300px] w-full max-w-[340px]"
                style={{ perspective: "1100px" }}
              >
                {/* Nested concentric mark circles (one inside another) */}
                <div
                  className="pointer-events-none absolute top-[46%] left-[62%] z-0 size-[210px] -translate-x-1/2 -translate-y-1/2"
                  aria-hidden
                >
                  <span className="absolute inset-0 rounded-full border border-[rgb(98_172_250/0.22)] border-dashed" />
                  <span className="absolute inset-[14%] rounded-full border border-[rgb(167_139_250/0.28)]" />
                  <span className="absolute inset-[28%] rounded-full border border-[rgb(98_172_250/0.18)] border-dashed" />
                  <span className="absolute inset-[42%] rounded-full bg-[radial-gradient(circle,rgb(98_172_250/0.12),transparent_70%)]" />
                </div>

                <svg
                  className="pointer-events-none absolute inset-0 z-[5] size-full overflow-visible"
                  viewBox="0 0 100 100"
                  aria-hidden
                >
                  <defs>
                    <linearGradient
                      id="hiw-beam"
                      gradientUnits="userSpaceOnUse"
                      x1="16"
                      y1="40"
                      x2="37"
                      y2="40"
                    >
                      <stop offset="0%" stopColor="#c4b5fd" stopOpacity="1" />
                      <stop offset="100%" stopColor="#62acfa" stopOpacity="0.9" />
                    </linearGradient>
                    {/* Hard stop at card left edge — beams never enter the card */}
                    <clipPath id="hiw-beam-clip">
                      <rect x="0" y="0" width="38" height="100" />
                    </clipPath>
                  </defs>
                  <g clipPath="url(#hiw-beam-clip)">
                    {/* Beams from all 3 icons → tip on card left edge; pulses travel along beams */}
                    {[
                      { y0: 18, y1: 28 },
                      { y0: 40, y1: 44 },
                      { y0: 62, y1: 60 },
                    ].map(({ y0, y1 }, i) => {
                      const d = `M 15 ${y0} Q 25 ${y0} 37.2 ${y1}`;
                      return (
                        <g key={i}>
                          <path
                            d={d}
                            fill="none"
                            stroke="#b8d9ff"
                            strokeWidth="1.05"
                            strokeLinecap="round"
                          />
                          <path
                            d={d}
                            fill="none"
                            stroke="url(#hiw-beam)"
                            strokeWidth="0.7"
                            strokeLinecap="round"
                          />
                          <TravelPulse
                            path={d}
                            duration={2.2 + i * 0.25}
                            delay={i * 0.35}
                            r={1.05}
                            glowR={2.1}
                          />
                          <circle cx="37.2" cy={y1} r="0.85" fill="#62acfa" fillOpacity="0.85" />
                        </g>
                      );
                    })}
                  </g>
                </svg>

                {/* Three glass icons — each has a beam erupting toward the card */}
                <div className="absolute top-[12%] left-0 z-20 flex flex-col gap-4">
                  {floatIcons.map((Icon, i) => (
                    <span
                      key={i}
                      className="flex size-11 items-center justify-center rounded-xl border border-[rgb(167_139_250/0.55)] text-[var(--color-sky)] backdrop-blur-xl"
                      style={{
                        background:
                          "linear-gradient(160deg, rgb(98 172 250 / 0.32), rgb(9 13 51 / 0.72))",
                        boxShadow:
                          "0 0 20px rgb(106 70 232 / 0.45), inset 0 0 12px rgb(255 255 255 / 0.1)",
                      }}
                    >
                      <Icon className="size-4" aria-hidden />
                    </span>
                  ))}
                </div>

                {/* Opaque card — covers any beam bleed; left edge ≈ 38% */}
                <div
                  className="absolute top-[8%] left-[38%] z-10 w-[56%] origin-left"
                  style={{
                    transform: "rotateY(-16deg) rotateX(7deg) rotateZ(-3deg)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  <div
                    className="rounded-2xl border border-[rgb(167_139_250/0.6)] p-3.5 sm:p-4"
                    style={{
                      background:
                        "linear-gradient(160deg, rgb(72 48 160 / 0.98), rgb(9 13 51 / 1))",
                      boxShadow:
                        "0 28px 55px rgb(0 0 0 / 0.55), 0 0 40px rgb(106 70 232 / 0.4), inset 0 1px 0 rgb(255 255 255 / 0.14)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white">My Profile</p>
                      <span className="inline-flex size-7 items-center justify-center rounded-lg border border-[rgb(98_172_250/0.35)] bg-[rgb(98_172_250/0.12)] text-[var(--color-sky)]">
                        <Pencil className="size-3.5" aria-hidden />
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-2.5">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[rgb(98_172_250/0.35)] bg-[rgb(16_113_250/0.25)]">
                        <UserRound className="size-5 text-white/90" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <span className="block h-2 w-[88%] rounded-full bg-white/30" />
                        <span className="block h-1.5 w-[62%] rounded-full bg-white/18" />
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 rounded-lg border border-[var(--color-rule)] bg-inset-strong px-2.5 py-2"
                        >
                          <div className="min-w-0 flex-1 space-y-1">
                            <span className="block h-1.5 w-full rounded-full bg-white/22" />
                            <span
                              className="block h-1.5 rounded-full bg-white/12"
                              style={{ width: `${70 - i * 12}%` }}
                            />
                          </div>
                          <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-[rgb(45_212_191/0.95)] text-[#06261f] shadow-[0_0_10px_rgb(45_212_191/0.55)]">
                            <Check className="size-3 stroke-[3]" aria-hidden />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Neon nested ring pedestal */}
                <div
                  className="pointer-events-none absolute bottom-2 left-[62%] z-0 flex -translate-x-1/2 flex-col items-center"
                  aria-hidden
                >
                  <div className="h-3.5 w-44 rounded-[100%] border border-[rgb(98_172_250/0.45)] bg-[radial-gradient(closest-side,rgb(98_172_250/0.5),rgb(106_70_232/0.22),transparent)] shadow-[0_0_28px_rgb(98_172_250/0.4)]" />
                  <div className="mt-0.5 h-2 w-32 rounded-[100%] border border-[rgb(167_139_250/0.4)] opacity-85" />
                  <div className="mt-0.5 h-1 w-20 rounded-[100%] border border-[rgb(98_172_250/0.28)] opacity-65" />
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-[var(--color-rule)] pt-5">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-rule)] px-3 py-2 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-sky)] hover:text-white disabled:opacity-40"
            onClick={() => go(index - 1)}
            disabled={index <= 0}
          >
            <ChevronLeft className="size-4" aria-hidden />
            Previous
          </button>
          <p className="text-xs text-[var(--color-faint)]">
            {index + 1} of {howItWorks.length}
          </p>
          <button
            type="button"
            className="sp-btn-primary !min-h-0 !px-4 !py-2 !text-sm"
            onClick={() => go(index + 1)}
            disabled={index >= howItWorks.length - 1}
          >
            Next
            <ArrowRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
