"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Award,
  Briefcase,
  Building2,
  Check,
  ChevronRight,
  ClipboardCheck,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Shield,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { audiences } from "@/lib/content";
import { cx } from "@/lib/utils";
import type { AudienceId } from "@/types";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const tabIcons: Record<AudienceId, typeof UserRound> = {
  candidates: UserRound,
  employers: Briefcase,
  verifiers: Shield,
  reviewers: Users,
  enterprises: Building2,
};

const benefitIcons = [
  LayoutDashboard,
  Shield,
  Award,
  Briefcase,
  Sparkles,
  Users,
] as const;

/**
 * Four marks around the passport — Skills / Credentials / Assessments / Opportunities
 * (matches Trust Ecosystem + brief), evenly spaced then animated around the ring.
 */
const orbitMarks = [
  { icon: GraduationCap, label: "Skills", angle: -50, tint: "#2dd4bf" },
  { icon: FileText, label: "Credentials", angle: 40, tint: "#c084fc" },
  { icon: ClipboardCheck, label: "Assessments", angle: 130, tint: "#62acfa" },
  { icon: Briefcase, label: "Opportunities", angle: 220, tint: "#f472b6" },
] as const;

/** Degrees per second for the orbit spin */
const ORBIT_DEG_PER_SEC = 14;

function polar(angleDeg: number, radiusPct: number) {
  const rad = (angleDeg * Math.PI) / 180;
  // String coords — avoids SSR/client float hydration mismatches.
  return {
    x: (50 + Math.cos(rad) * radiusPct).toFixed(4),
    y: (50 + Math.sin(rad) * radiusPct).toFixed(4),
  };
}

export function SolutionsExplorer() {
  const [active, setActive] = useState<AudienceId>("candidates");
  const [orbitPhase, setOrbitPhase] = useState(0);
  const reduce = usePrefersReducedMotion();
  const audience = audiences.find((a) => a.id === active) ?? audiences[0];
  const TabIcon = tabIcons[audience.id] ?? UserRound;

  useEffect(() => {
    if (reduce) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      setOrbitPhase(((now - start) / 1000) * ORBIT_DEG_PER_SEC);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduce]);

  return (
    <div>
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Solutions by audience"
      >
        {audiences.map((item) => {
          const Icon = tabIcons[item.id] ?? UserRound;
          const selected = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`panel-${item.id}`}
              className={cx(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition",
                selected
                  ? "border-[var(--color-violet-line)] bg-[linear-gradient(135deg,rgb(82_36_212/0.55),rgb(16_113_250/0.35))] text-white shadow-[0_0_24px_rgb(82_36_212/0.35)]"
                  : "border-[var(--color-rule)] bg-white/[0.03] text-[var(--color-muted)] hover:border-[var(--color-sky)] hover:text-white",
              )}
              onClick={() => setActive(item.id)}
            >
              <Icon className="size-4" aria-hidden />
              {item.title}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={audience.id}
            id={`panel-${audience.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${audience.id}`}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="grid gap-4 lg:grid-cols-[1.15fr_0.9fr]"
          >
            <div className="rounded-[22px] border border-[rgb(98_172_250/0.18)] bg-[linear-gradient(165deg,rgb(18_22_70/0.82),rgb(9_13_51/0.72))] p-5 backdrop-blur-xl sm:p-6">
              <p className="sp-eyebrow mb-2">{audience.eyebrow}</p>
              <h3 className="sp-heading text-[clamp(26px,3vw,36px)]">
                {audience.headline.includes(audience.accentWord) ? (
                  <>
                    {audience.headline.split(audience.accentWord)[0]}
                    <span className="sp-gradient-text">{audience.accentWord}</span>
                    {audience.headline
                      .split(audience.accentWord)
                      .slice(1)
                      .join(audience.accentWord)}
                  </>
                ) : (
                  audience.headline
                )}
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-muted)] sm:text-[15px]">
                {audience.summary}
              </p>
              <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {audience.benefits.slice(0, 6).map((benefit, i) => {
                  const Icon = benefitIcons[i] ?? LayoutDashboard;
                  return (
                    <li
                      key={benefit}
                      className="flex items-start gap-2.5 rounded-xl border border-[var(--color-rule)] bg-inset px-3 py-2.5 text-sm text-[var(--color-muted)]"
                    >
                      <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-[rgb(98_172_250/0.28)] bg-[rgb(98_172_250/0.12)] text-[var(--color-sky)]">
                        <Icon className="size-3.5" aria-hidden />
                      </span>
                      <span className="leading-snug">{benefit}</span>
                    </li>
                  );
                })}
              </ul>
              <Link
                href={audience.href}
                className="sp-btn-primary mt-6 inline-flex items-center gap-1"
              >
                Open {audience.title} page
                <ChevronRight className="size-4" aria-hidden />
              </Link>
            </div>

            <div className="rounded-[22px] border border-[rgb(98_172_250/0.2)] bg-[linear-gradient(165deg,rgb(18_22_70/0.85),rgb(9_13_51/0.75))] p-5 backdrop-blur-xl sm:p-6">
              {/* Inclined glassy passport — 4 edge icons inset, not touching (Solutions mock) */}
              <div
                className="relative mx-auto h-[250px] w-full max-w-[280px]"
                style={{ perspective: "1000px" }}
              >
                <svg
                  className="pointer-events-none absolute inset-0 size-full opacity-60"
                  viewBox="0 0 100 100"
                  aria-hidden
                >
                  <ellipse
                    cx="50"
                    cy="52"
                    rx="36"
                    ry="32"
                    fill="none"
                    stroke="rgb(98 172 250 / 0.35)"
                    strokeWidth="0.45"
                    strokeDasharray="1.3 1.5"
                  />
                  <ellipse
                    cx="50"
                    cy="52"
                    rx="28"
                    ry="24"
                    fill="none"
                    stroke="rgb(167 139 250 / 0.22)"
                    strokeWidth="0.35"
                  />
                </svg>

                {orbitMarks.map(({ icon: Icon, angle, tint, label }) => {
                  const pos = polar(angle + orbitPhase, 42);
                  return (
                    <span
                      key={label}
                      title={label}
                      aria-hidden
                      className="absolute z-20 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border backdrop-blur-xl will-change-[left,top]"
                      style={{
                        left: `${pos.x}%`,
                        top: `${pos.y}%`,
                        borderColor: `${tint}77`,
                        background: `linear-gradient(160deg, ${tint}44, rgb(9 13 51 / 0.55))`,
                        boxShadow: `0 0 22px ${tint}55, inset 0 0 10px rgb(255 255 255 / 0.1)`,
                        color: tint,
                      }}
                    >
                      <Icon className="size-4" aria-hidden />
                    </span>
                  );
                })}

                <div
                  className="absolute left-1/2 top-[50%] z-10 w-[54%]"
                  style={{
                    transform:
                      "translate(-50%, -50%) rotateY(-20deg) rotateX(9deg) rotateZ(-5deg)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  <div
                    className="relative rounded-2xl border border-[rgb(98_172_250/0.5)] p-4 text-center backdrop-blur-xl"
                    style={{
                      background:
                        "linear-gradient(160deg, rgb(98 172 250 / 0.28), rgb(106 70 232 / 0.18), rgb(9 13 51 / 0.85))",
                      boxShadow:
                        "0 24px 55px rgb(0 0 0 / 0.5), 0 0 42px rgb(98 172 250 / 0.32), inset 0 1px 0 rgb(255 255 255 / 0.14)",
                    }}
                  >
                    <p className="absolute top-2.5 right-2.5 inline-flex items-center gap-0.5 rounded-full bg-[rgb(16_185_129/0.28)] px-1.5 py-0.5 text-[9px] font-medium text-emerald-300">
                      <Check className="size-2.5" aria-hidden />
                      Verified
                    </p>
                    <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-[rgb(98_172_250/0.4)] bg-[rgb(16_113_250/0.22)]">
                      <TabIcon className="size-5 text-white" aria-hidden />
                    </div>
                    <div className="mt-3 space-y-1.5">
                      <span className="mx-auto block h-1.5 w-16 rounded-full bg-white/30" />
                      <span className="mx-auto block h-1.5 w-12 rounded-full bg-white/18" />
                      <span className="mx-auto block h-1.5 w-10 rounded-full bg-white/12" />
                    </div>
                  </div>
                </div>
              </div>

              <h4 className="mt-4 text-[11px] font-medium tracking-[0.14em] text-[#bdb4ff] sm:text-xs">
                PRODUCT CAPABILITIES
              </h4>
              <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {audience.features.slice(0, 8).map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-[13px] leading-snug text-[var(--color-muted)] sm:text-sm"
                  >
                    <span className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-[rgb(98_172_250/0.18)] text-[var(--color-sky)]">
                      <Check className="size-2.5" aria-hidden />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
