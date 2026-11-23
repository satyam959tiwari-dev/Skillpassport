"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from "motion/react";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Briefcase,
  LifeBuoy,
  Check,
  ClipboardCheck,
  Layers,
  Play,
  ShieldCheck,
  UserRound,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { cx } from "@/lib/utils";
import s from "./CandidateHero.module.css";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type Cta = { label: string; href: string };

type Props = {
  primaryCta?: Cta;
  secondaryCta?: Cta;
};

/* ------------------------------------------------------------------ */
/* Static data                                                         */
/* ------------------------------------------------------------------ */

const features: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: UserRound, title: "My Profile", body: "Photo, visibility & share link" },
  { icon: Zap, title: "AI help", body: "Summary & assessment suggestions" },
  { icon: LifeBuoy, title: "Support", body: "Raise Query & ticket tracking" },
];

/** Three factual feature facts (no metrics) — what a candidate gets, in brief terms. */
const stats: { icon: LucideIcon; title: string; label: string }[] = [
  { icon: ShieldCheck, title: "Verified documents", label: "Status tracked per file" },
  { icon: ClipboardCheck, title: "Assessments", label: "Graded by expert reviewers" },
  { icon: Briefcase, title: "Jobs & referrals", label: "Find Jobs · Refer & Earn" },
];

type Chip = {
  label: string;
  icon: LucideIcon;
  /** position in % of the stage */
  pos: { left?: string; right?: string; top: string };
  depth: number;
  float: number;
  delay: number;
  arrow?: boolean;
};

const chips: Chip[] = [
  { label: "Skills", icon: Layers, pos: { left: "12%", top: "12%" }, depth: 28, float: 5.2, delay: 0.9 },
  { label: "Credentials", icon: Award, pos: { right: "0%", top: "15%" }, depth: 34, float: 6.1, delay: 1.05 },
  { label: "Assessments", icon: ClipboardCheck, pos: { left: "-2%", top: "41%" }, depth: 40, float: 5.6, delay: 1.2 },
  { label: "Reviews", icon: Users, pos: { right: "-3%", top: "47%" }, depth: 30, float: 6.6, delay: 1.35 },
  { label: "Jobs", icon: Briefcase, pos: { right: "8%", top: "64%" }, depth: 22, float: 5.9, delay: 1.5, arrow: true },
];

const checks = ["Identity Verified", "Credentials Added", "Assessments Linked"];
const bars = [22, 30, 26, 40, 34, 52, 46, 68, 60, 84, 100];

/** Deterministic star field (same on server + client → no hydration mismatch). */
const stars = Array.from({ length: 46 }, (_, i) => {
  const r = (n: number) => {
    const x = Math.sin((i + 1) * 9301 + n * 49297) * 233280;
    return x - Math.floor(x);
  };
  return {
    left: `${(r(1) * 100).toFixed(2)}%`,
    top: `${(r(2) * 100).toFixed(2)}%`,
    size: 1 + r(3) * 2.2,
    dur: `${(2.8 + r(4) * 4).toFixed(2)}s`,
    delay: `${(r(5) * 4).toFixed(2)}s`,
  };
});

/* Orbit geometry (SVG viewBox 0 0 600 600) */
const ORBIT_FULL = "M 6,300 a 294,92 0 1,0 588,0 a 294,92 0 1,0 -588,0";
const ORBIT_FRONT = "M 6,300 a 294,92 0 0,0 588,0";

/* ------------------------------------------------------------------ */
/* Motion variants                                                     */
/* ------------------------------------------------------------------ */

const column: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 22, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function CandidateHero({
  primaryCta = { label: "Create Your Passport", href: "/create-passport/" },
  secondaryCta = { label: "Try the Workspace", href: "#demo" },
}: Props) {
  const reduce = usePrefersReducedMotion();

  return (
    <div className="relative isolate">
      {/* Background — same brand ground as PageHero, plus stars + light waves */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(55% 55% at 12% 40%, rgb(22 17 82 / 0.98) 0%, transparent 70%),
              radial-gradient(42% 48% at 76% 34%, rgb(16 113 250 / 0.26) 0%, transparent 62%),
              radial-gradient(38% 42% at 78% 82%, rgb(68 30 182 / 0.38) 0%, transparent 65%),
              linear-gradient(105deg, #090d33 0%, #090d33 42%, #05071c 68%, #030508 100%)
            `,
          }}
        />
        <div
          className="absolute inset-x-0 top-0 h-40"
          style={{ background: "linear-gradient(180deg, rgb(3 5 8 / 0.75) 0%, transparent 100%)" }}
        />
        <div className={s.stars}>
          {stars.map((st, i) => (
            <span
              key={i}
              className={s.star}
              style={
                {
                  left: st.left,
                  top: st.top,
                  width: st.size,
                  height: st.size,
                  "--dur": st.dur,
                  "--delay": st.delay,
                } as CSSProperties
              }
            />
          ))}
        </div>
        <Waves reduce={reduce} />
        {/* Seamless hand-off to the next section (no hard rule) */}
        <div
          className="absolute inset-x-0 bottom-0 h-28"
          style={{ background: "linear-gradient(180deg, rgb(9 13 51 / 0) 0%, #090d33 100%)" }}
        />
      </div>

      <SiteHeader variant="page" />

      <div className="sp-container relative z-10 pb-16 pt-6 sm:pb-20 sm:pt-10">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,1fr)] lg:gap-8 xl:gap-14">
          {/* ---------------- Left column ---------------- */}
          <motion.div
            className="max-w-2xl"
            variants={column}
            initial={reduce ? false : "hidden"}
            animate="show"
          >
            <motion.p variants={item} className="sp-eyebrow !text-[13px] !tracking-[0.22em] !text-[var(--color-sky)]">
              Candidate experience
            </motion.p>

            <motion.h1
              variants={item}
              className="sp-heading text-white"
              style={{ fontSize: "clamp(34px, 3.6vw, 56px)", lineHeight: 1.1, fontWeight: 700, margin: "1.25rem 0 0" }}
            >
              Turn your skills, proof, and experience into a trusted{" "}
              <span className={s.headlineGradient}>SkillPassport.</span>
            </motion.h1>

            <motion.p variants={item} className="sp-lede mt-5 max-w-xl">
              Build a verified, portable profile of your identity, skills, credentials,
              assessments, and work — and let opportunities find you.
            </motion.p>

            <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-4">
              <ButtonLink
                href={primaryCta.href}
                className={cx(
                  s.primaryGlow,
                  "group !rounded-xl !px-7 shadow-[0_0_32px_rgb(82_36_212/0.55),0_0_0_1px_rgb(98_172_250/0.35)]",
                )}
              >
                {primaryCta.label}
                <ArrowRight
                  className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden
                />
              </ButtonLink>
              <a
                href={secondaryCta.href}
                className="group inline-flex min-h-[50px] items-center gap-3 rounded-xl border border-[rgb(98_172_250/0.35)] bg-white/[0.04] px-6 text-[16px] font-medium text-white backdrop-blur-md transition hover:border-[rgb(98_172_250/0.7)] hover:bg-white/[0.08] hover:shadow-[0_0_28px_rgb(98_172_250/0.25)]"
              >
                <span className="flex size-7 items-center justify-center rounded-full border border-[rgb(98_172_250/0.5)] bg-[rgb(98_172_250/0.12)] transition group-hover:scale-110">
                  <Play className="size-3 fill-[var(--color-sky)] text-[var(--color-sky)]" aria-hidden />
                </span>
                {secondaryCta.label}
              </a>
            </motion.div>

            <motion.ul variants={item} className="mt-9 grid gap-5 sm:grid-cols-3">
              {features.map(({ icon: Icon, title, body }) => (
                <li key={title} className="group flex items-start gap-3">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-[rgb(98_172_250/0.28)] bg-[linear-gradient(160deg,rgb(98_172_250/0.18),rgb(82_36_212/0.14))] text-[var(--color-sky)] shadow-[0_0_18px_rgb(98_172_250/0.2)] transition group-hover:shadow-[0_0_26px_rgb(98_172_250/0.45)]">
                    <Icon className="size-[18px]" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-[15px] font-semibold text-white">{title}</span>
                    <span className="mt-0.5 block text-[13px] text-[var(--color-faint)]">{body}</span>
                  </span>
                </li>
              ))}
            </motion.ul>

            <motion.div
              variants={item}
              className="sp-glass relative mt-8 grid grid-cols-3 overflow-hidden !rounded-2xl"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgb(98_172_250/0.7),transparent)]"
              />
              {stats.map(({ icon: Icon, title, label }, i) => (
                <div
                  key={title}
                  className={cx(
                    "flex flex-col items-start gap-2 px-3.5 py-4 sm:flex-row sm:items-center sm:gap-3 sm:px-5 sm:py-5",
                    i > 0 && "border-l border-[rgb(98_172_250/0.16)]",
                  )}
                >
                  <Icon className="size-6 shrink-0 text-[var(--color-sky)] drop-shadow-[0_0_8px_rgb(98_172_250/0.7)]" aria-hidden />
                  <div className="min-w-0">
                    <span className="block text-[clamp(13px,1.15vw,15px)] font-semibold leading-snug text-white">{title}</span>
                    <span className="mt-0.5 block text-[12px] leading-tight text-[var(--color-faint)]">{label}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ---------------- Right column ---------------- */}
          <div className="min-w-0">
            <PassportStage reduce={reduce} />
            {/* Phones: the floating chips restack as a tidy row instead of overlapping the card */}
            <ul className="mt-2 flex flex-wrap justify-center gap-2 sm:hidden" aria-label="What your passport connects">
              {chips.map(({ label, icon: Icon, arrow }) => (
                <li
                  key={label}
                  className="flex items-center gap-1.5 rounded-xl border border-[rgb(98_172_250/0.38)] bg-[linear-gradient(160deg,rgb(98_172_250/0.16),rgb(68_30_182/0.22))] px-2.5 py-1.5 text-[13px] font-medium text-white shadow-[0_0_18px_rgb(98_172_250/0.25)]"
                >
                  <Icon className="size-3.5 text-[#a9d3ff]" aria-hidden />
                  {label}
                  {arrow ? (
                    <ArrowRight className="size-3 text-[var(--color-sky)]" aria-hidden />
                  ) : (
                    <span className="flex size-3.5 items-center justify-center rounded-full bg-emerald-400/90 text-[#062a1c]">
                      <Check className="size-2.5" strokeWidth={3.5} aria-hidden />
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Holographic passport stage                                          */
/* ------------------------------------------------------------------ */

function PassportStage({ reduce }: { reduce: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 90, damping: 18, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 90, damping: 18, mass: 0.6 });

  const rotY = useTransform(sx, [-0.5, 0.5], [-20, 4]);
  const rotX = useTransform(sy, [-0.5, 0.5], [12, 0]);
  const glareX = useTransform(sx, [-0.5, 0.5], ["10%", "90%"]);
  const glareY = useTransform(sy, [-0.5, 0.5], ["10%", "90%"]);

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType === "touch" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      initial={reduce ? false : { opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      className="relative mx-auto aspect-square w-full max-w-[640px] select-none [perspective:1400px]"
      role="img"
      aria-label="Your Digital Passport: identity verified, credentials added, assessments linked — connected to skills, credentials, assessments, reviews and jobs."
    >
      {/* Globe */}
      <div className={s.globe} aria-hidden>
        <div className={s.globeDots} />
      </div>

      {/* Orbit (back half) */}
      <OrbitSvg reduce={reduce} layer="back" />

      {/* Light beam + pedestal */}
      <div className={s.beam} aria-hidden />
      <div className={s.pedestal} aria-hidden>
        <div className={s.ringBase} />
        <div className={s.ripple} />
        <div className={s.ripple} />
        <div className={s.ripple} />
        <div className={s.ring} />
        <div className={s.ringInner} />
      </div>

      {/* Passport card */}
      <div data-orbit-card className="absolute left-1/2 top-[9%] w-[64%] -translate-x-1/2 [transform-style:preserve-3d] sm:top-[13%] sm:w-[50%]">
        <motion.div
          animate={reduce ? undefined : { y: [0, -14, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="[transform-style:preserve-3d]"
        >
          <motion.div
            style={reduce ? { rotateY: -12, rotateX: 6 } : { rotateY: rotY, rotateX: rotX }}
            className="relative aspect-[0.8] rounded-[22px] [transform-style:preserve-3d]"
          >
            <PassportCard reduce={reduce} glareX={glareX} glareY={glareY} />
          </motion.div>
        </motion.div>
      </div>

      {/* Orbit (front half — passes in front of the card) */}
      <OrbitSvg reduce={reduce} layer="front" />

      {/* Floating chips */}
      {chips.map((c) => (
        <FloatingChip key={c.label} chip={c} sx={sx} sy={sy} reduce={reduce} />
      ))}
    </motion.div>
  );
}

function PassportCard({
  reduce,
  glareX,
  glareY,
}: {
  reduce: boolean;
  glareX: MotionValue<string>;
  glareY: MotionValue<string>;
}) {
  const glare = useTransform(
    [glareX, glareY] as MotionValue<string>[],
    ([x, y]: string[]) =>
      `radial-gradient(circle at ${x} ${y}, rgb(255 255 255 / 0.22), transparent 45%)`,
  );

  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-[22px] border border-white/10 p-[7%] backdrop-blur-xl"
      style={{
        background:
          "linear-gradient(160deg, rgb(98 172 250 / 0.22) 0%, rgb(68 30 182 / 0.32) 45%, rgb(16 20 80 / 0.55) 100%)",
        boxShadow:
          "0 0 0 1px rgb(98 172 250 / 0.25), 0 0 60px rgb(98 172 250 / 0.45), 0 0 120px rgb(82 36 212 / 0.45), 0 40px 80px rgb(0 0 0 / 0.5), inset 0 1px 0 rgb(255 255 255 / 0.25)",
      }}
    >
      <div className={s.cardBorder} aria-hidden />
      <div className={s.cardShimmer} aria-hidden />
      <div className={s.scanline} aria-hidden />
      {!reduce && (
        <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glare }} />
      )}

      <div className="relative flex h-full flex-col text-white [font-size:clamp(9px,1.45vw,15px)] max-sm:[font-size:clamp(10px,3.2vw,15px)]">
        {/* header */}
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-[0.4em] font-semibold">
            <Layers className="size-[1.4em] text-[var(--color-sky)]" aria-hidden />
            SkillPassport
          </span>
          <span className="flex items-center gap-[0.3em] rounded-full border border-emerald-300/40 bg-emerald-400/10 px-[0.6em] py-[0.2em] text-[0.72em] text-emerald-200 shadow-[0_0_12px_rgb(52_211_153/0.35)]">
            <BadgeCheck className="size-[1.1em]" aria-hidden />
            Verified Profile
          </span>
        </div>

        {/* identity */}
        <div className="mt-[9%] flex items-center gap-[0.9em]">
          <span className="relative flex size-[3.8em] shrink-0 items-center justify-center rounded-full border border-[rgb(98_172_250/0.6)] bg-[radial-gradient(circle_at_50%_35%,rgb(98_172_250/0.5),rgb(22_17_82/0.9))] shadow-[0_0_24px_rgb(98_172_250/0.6)]">
            <UserRound className="size-[2.2em] text-[#bfe0ff]" aria-hidden />
            {!reduce && (
              <motion.span
                aria-hidden
                className="absolute inset-[-4px] rounded-full border border-[rgb(98_172_250/0.6)]"
                animate={{ scale: [1, 1.25], opacity: [0.8, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
              />
            )}
          </span>
          <span className="text-[1.45em] font-bold leading-tight">
            Your
            <br />
            Digital Passport
          </span>
        </div>

        {/* checks */}
        <ul className="mt-[9%] space-y-[0.55em]">
          {checks.map((c, i) => (
            <motion.li
              key={c}
              initial={reduce ? false : { opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 + i * 0.25, duration: 0.5 }}
              className="flex items-center gap-[0.6em] rounded-[0.6em] border border-white/10 bg-white/[0.06] px-[0.6em] py-[0.4em] text-[0.88em] italic text-[#dfe8ff]"
            >
              <motion.span
                initial={reduce ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2 + i * 0.25, type: "spring", stiffness: 380, damping: 14 }}
                className="flex size-[1.4em] items-center justify-center rounded-full border border-emerald-300/60 bg-emerald-400/15 text-emerald-300 shadow-[0_0_10px_rgb(52_211_153/0.55)]"
              >
                <Check className="size-[0.9em]" strokeWidth={3} aria-hidden />
              </motion.span>
              {c}
            </motion.li>
          ))}
        </ul>

        {/* chart */}
        <div className="mt-auto flex h-[18%] items-end gap-[3%] pt-[4%]">
          {bars.map((h, i) => (
            <motion.span
              key={i}
              initial={reduce ? false : { scaleY: 0 }}
              animate={reduce ? { scaleY: 1 } : { scaleY: [0, 1, 0.82, 1] }}
              transition={{
                delay: 1.6 + i * 0.06,
                duration: 1.4,
                ease: "easeOut",
              }}
              style={{ height: `${h}%` }}
              className="flex-1 origin-bottom rounded-t-[2px] bg-[linear-gradient(180deg,#9fd0ff,#3387f2_60%,#5224d4)] shadow-[0_0_10px_rgb(98_172_250/0.7)]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function FloatingChip({
  chip,
  sx,
  sy,
  reduce,
}: {
  chip: Chip;
  sx: MotionValue<number>;
  sy: MotionValue<number>;
  reduce: boolean;
}) {
  const x = useTransform(sx, [-0.5, 0.5], [-chip.depth, chip.depth]);
  const y = useTransform(sy, [-0.5, 0.5], [-chip.depth * 0.6, chip.depth * 0.6]);
  const Icon = chip.icon;

  return (
    <motion.div
      className="absolute z-20 max-sm:hidden"
      style={{ ...chip.pos, x: reduce ? 0 : x, y: reduce ? 0 : y }}
      initial={reduce ? false : { opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: chip.delay, type: "spring", stiffness: 220, damping: 18 }}
    >
      <motion.div
        animate={reduce ? undefined : { y: [0, -10, 0] }}
        transition={{ duration: chip.float, repeat: Infinity, ease: "easeInOut", delay: chip.delay }}
        whileHover={reduce ? undefined : { scale: 1.08 }}
        className="group flex items-center gap-[0.55em] rounded-xl border border-[rgb(98_172_250/0.38)] bg-[linear-gradient(160deg,rgb(98_172_250/0.16),rgb(68_30_182/0.22))] px-[0.85em] py-[0.6em] text-[clamp(10px,1.35vw,15px)] font-medium text-white shadow-[0_0_24px_rgb(98_172_250/0.3),0_12px_30px_rgb(0_0_0/0.35),inset_0_1px_0_rgb(255_255_255/0.15)] backdrop-blur-md transition-[box-shadow,border-color] hover:border-[rgb(98_172_250/0.75)] hover:shadow-[0_0_38px_rgb(98_172_250/0.6),0_12px_30px_rgb(0_0_0/0.35)]"
      >
        <span className="flex size-[1.9em] items-center justify-center rounded-lg bg-[rgb(98_172_250/0.15)] text-[#a9d3ff]">
          <Icon className="size-[1.2em]" aria-hidden />
        </span>
        {chip.label}
        {chip.arrow ? (
          <ArrowRight className="size-[1em] text-[var(--color-sky)]" aria-hidden />
        ) : (
          <span className="flex size-[1.2em] items-center justify-center rounded-full bg-emerald-400/90 text-[#062a1c] shadow-[0_0_10px_rgb(52_211_153/0.7)]">
            <Check className="size-[0.8em]" strokeWidth={3.5} aria-hidden />
          </span>
        )}
      </motion.div>
    </motion.div>
  );
}

type MaskRect = { x: number; y: number; w: number; h: number; r: number };

/** Back layer only: measure the passport card in the svg's user space so the back-arc
 *  balls are masked out wherever the card covers them (the card is translucent glass,
 *  so z-order alone would still let them glow through). Runs after mount → the server
 *  and first client render share the same empty rect (hydration-safe). */
function useCardMask(svgRef: RefObject<SVGSVGElement | null>, enabled: boolean) {
  const [rect, setRect] = useState<MaskRect>({ x: 0, y: 0, w: 0, h: 0, r: 0 });
  useEffect(() => {
    const svg = svgRef.current;
    const card = svg?.parentElement?.querySelector<HTMLElement>("[data-orbit-card]");
    if (!enabled || !svg || !card) return;
    const measure = () => {
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const inv = ctm.inverse();
      const b = card.getBoundingClientRect();
      const p1 = new DOMPoint(b.left, b.top).matrixTransform(inv);
      const p2 = new DOMPoint(b.right, b.bottom).matrixTransform(inv);
      const k = (p2.x - p1.x) / Math.max(1, b.width);
      const pad = 6; // covers the slight 3D tilt
      const lift = 16 * k; // card floats up to 14px
      setRect({ x: p1.x - pad, y: p1.y - pad - lift, w: p2.x - p1.x + pad * 2, h: p2.y - p1.y + pad * 2 + lift, r: 22 * k });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(svg);
    ro.observe(card);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [svgRef, enabled]);
  return rect;
}

function OrbitSvg({ reduce, layer }: { reduce: boolean; layer: "back" | "front" }) {
  const id = `orbit-${layer}`;
  const svgRef = useRef<SVGSVGElement>(null);
  const card = useCardMask(svgRef, layer === "back");
  return (
    <svg
      ref={svgRef}
      viewBox="0 0 600 600"
      className={cx("pointer-events-none absolute inset-0 h-full w-full overflow-visible", layer === "front" ? "z-10" : "")}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${id}-g`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#62acfa" stopOpacity="0.15" />
          <stop offset="0.35" stopColor="#8b7bff" stopOpacity="0.95" />
          <stop offset="0.7" stopColor="#62acfa" stopOpacity="1" />
          <stop offset="1" stopColor="#b38cff" stopOpacity="0.2" />
        </linearGradient>
        <clipPath id={`${id}-half`} clipPathUnits="userSpaceOnUse">
          {layer === "front" ? <rect x="-200" y="300" width="1000" height="500" /> : <rect x="-200" y="-200" width="1000" height="500" />}
        </clipPath>
        {layer === "back" && (
          <mask id={`${id}-card`} maskUnits="userSpaceOnUse" x="-400" y="-400" width="1400" height="1400">
            <rect x="-400" y="-400" width="1400" height="1400" fill="#fff" />
            {/* balls live inside the rotate(-14) group, so counter-rotate the card cut-out */}
            <rect x={card.x} y={card.y} width={card.w} height={card.h} rx={card.r} fill="#000" transform="rotate(14 300 300)" />
          </mask>
        )}
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g transform="rotate(-14 300 300)">
        {layer === "back" ? (
          <path d={ORBIT_FULL} fill="none" stroke={`url(#${id}-g)`} strokeOpacity="0.45" strokeWidth="2" />
        ) : (
          <>
            <path
              d={ORBIT_FRONT}
              fill="none"
              stroke={`url(#${id}-g)`}
              strokeWidth="3.5"
              filter={`url(#${id}-glow)`}
            />
            <path
              d={ORBIT_FRONT}
              fill="none"
              stroke="#cfe4ff"
              strokeOpacity="0.7"
              strokeWidth="1.2"
              strokeDasharray="4 18"
              className={s.spinDash}
            />
          </>
        )}
        {/* Travelling balls — rendered in BOTH layers with the same SMIL timing, each copy
            clipped to its half of the orbit: the back copy (below the card) only shows on
            the upper/back arc, the front copy (above the card) only on the lower/front arc.
            The two halves meet exactly on the orbit's major axis, so there's no jump. */}
        <g clipPath={`url(#${id}-half)`} mask={layer === "back" ? `url(#${id}-card)` : undefined}>
          {[0, 1].map((k) => (
            <circle
              key={k}
              r="7"
              fill="#e6f2ff"
              filter={`url(#${id}-glow)`}
              cx={reduce ? (k ? 520 : 120) : 0}
              cy={reduce ? (k ? 360 : 372) : 0}
            >
              {!reduce && (
                <animateMotion dur="11s" begin={`${-k * 5.5}s`} repeatCount="indefinite" path={ORBIT_FULL} />
              )}
            </circle>
          ))}
        </g>
      </g>
    </svg>
  );
}

function Waves({ reduce }: { reduce: boolean }) {
  const paths = [
    "M0,140 C240,60 480,220 720,130 C960,40 1200,200 1440,110",
    "M0,170 C260,90 500,250 760,150 C1000,60 1220,230 1440,140",
    "M0,200 C280,120 520,270 800,175 C1040,90 1240,250 1440,170",
  ];
  return (
    <svg className={s.waves} viewBox="0 0 1440 260" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="cand-wave" x1="0" x2="1">
          <stop offset="0" stopColor="#62acfa" stopOpacity="0" />
          <stop offset="0.5" stopColor="#62acfa" stopOpacity="0.6" />
          <stop offset="1" stopColor="#6a46e8" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      {paths.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          fill="none"
          stroke="url(#cand-wave)"
          strokeWidth={1.2}
          initial={reduce ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 - i * 0.25 }}
          transition={{ duration: 2.4, delay: 0.4 + i * 0.25, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
}
