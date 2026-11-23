"use client";

/**
 * Shared building blocks for the audience heroes (employers, verifiers,
 * reviewers, enterprises): page ground + dotted wave, the copy column with a
 * staggered entrance, a fixed-design "stage" that scales to its column, and
 * connector wires with travelling pulses (no static end dots).
 */

import { MotionConfig, motion, type Variants } from "motion/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { cx } from "@/lib/utils";
import k from "./HeroKit.module.css";

export type HeroCta = { label: string; href: string };

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const column: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Wraps the accent word (plus trailing punctuation, e.g. "trust.") in the hero accent style. */
export function accentTitle(headline: string, accent: string): ReactNode {
  const idx = headline.toLowerCase().indexOf(accent.toLowerCase());
  if (idx < 0) return headline;
  let end = idx + accent.length;
  if (headline.charAt(end) === ".") end += 1;
  return (
    <>
      {headline.slice(0, idx)}
      <span className={k.accent}>{headline.slice(idx, end)}</span>
      {headline.slice(end)}
    </>
  );
}

const RM_QUERY = "(prefers-reduced-motion: reduce)";
function subscribeRM(cb: () => void) {
  const m = window.matchMedia(RM_QUERY);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
}

/**
 * prefers-reduced-motion that is hydration-safe: the server and the hydration
 * pass both read `false`, then React re-renders with the real value — so the
 * SSR markup always matches and reduced-motion users still lose the motion.
 */
export function useHeroReducedMotion() {
  return useSyncExternalStore(
    subscribeRM,
    () => window.matchMedia(RM_QUERY).matches,
    () => false,
  );
}

function HeroLink({
  cta,
  primary,
  outline,
  icon,
}: {
  cta: HeroCta;
  primary?: boolean;
  outline?: boolean;
  icon?: ReactNode;
}) {
  const className = primary ? k.primary : outline ? k.outline : k.secondary;
  const content = (
    <>
      {icon}
      <span>{cta.label}</span>
      {icon ? null : <ArrowRight className={k.arrow} aria-hidden />}
    </>
  );
  if (cta.href.startsWith("#")) {
    return (
      <a href={cta.href} className={className}>
        {content}
      </a>
    );
  }
  return (
    <Link href={cta.href} className={className}>
      {content}
    </Link>
  );
}

type ShellProps = {
  eyebrow: string;
  title: ReactNode;
  description: string;
  primaryCta: HeroCta;
  secondaryCta: HeroCta;
  /** Right-hand illustrative scene */
  scene: ReactNode;
  /** Optional full-width row under the hero grid (e.g. a flow bar) */
  footer?: ReactNode;
  /** "overlap": scene bleeds into the copy column (employers layout) */
  layout?: "split" | "overlap";
  className?: string;
  titleClassName?: string;
  /** Extra copy-column content below the CTAs (disclaimer, feature row…) */
  extra?: ReactNode;
  /** "pill": boxed kicker (contact reference) instead of the line kicker */
  eyebrowVariant?: "line" | "pill";
  /** Optional label for the hero region */
  ariaLabel?: string;
  /** Extra decorative layer rendered inside the page ground */
  ground?: ReactNode;
  /** "outline": bordered pill secondary button (AI / contact references) */
  secondaryVariant?: "link" | "outline";
  secondaryIcon?: ReactNode;
  primaryIcon?: ReactNode;
  /** Desktop column split, e.g. "minmax(0,48fr) minmax(0,52fr)" */
  columns?: string;
};

export function AudienceHeroShell({
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
  scene,
  footer,
  layout = "split",
  className,
  titleClassName,
  extra,
  eyebrowVariant = "line",
  ariaLabel,
  ground,
  secondaryVariant = "link",
  secondaryIcon,
  primaryIcon,
  columns,
}: ShellProps) {
  return (
    <MotionConfig reducedMotion="user">
    <section aria-label={ariaLabel} className={cx("relative isolate", k.hero, className)}>
      <div className={k.ground} aria-hidden>
        <div className={k.groundGlow} />
        <div className={k.wave}>
          <div className={k.waveDots} />
          <svg className={k.waveLine} viewBox="0 0 1600 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="hk-wave-line" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#6a46e8" stopOpacity="0.2" />
                <stop offset="0.6" stopColor="#62acfa" stopOpacity="0.85" />
                <stop offset="1" stopColor="#1071fa" stopOpacity="0.55" />
              </linearGradient>
            </defs>
            <path
              d="M0 70 Q260 200 480 118 T900 136 T1320 108 T1600 22"
              fill="none"
              stroke="url(#hk-wave-line)"
              strokeWidth="1.6"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
        {ground}
        <div className={k.groundFade} />
      </div>

      <SiteHeader variant="page" />

      <div className={cx("sp-container relative z-10", k.body)}>
        <div
          className={cx(k.grid, layout === "overlap" && k.gridOverlap)}
          style={columns ? ({ "--hk-cols": columns } as CSSProperties) : undefined}
        >
          <motion.div
            className={k.copy}
            variants={column}
            initial="hidden"
            animate="show"
          >
            <motion.p
              variants={item}
              className={cx(eyebrowVariant === "pill" ? k.kickerPill : "sp-eyebrow", eyebrowVariant !== "pill" && k.kicker)}
            >
              {eyebrow}
            </motion.p>
            <motion.h1 variants={item} className={cx(k.title, titleClassName)}>
              {title}
            </motion.h1>
            <motion.p variants={item} className={k.desc}>
              {description}
            </motion.p>
            <motion.div variants={item} className={k.actions} data-variant={secondaryVariant}>
              <HeroLink cta={primaryCta} primary icon={primaryIcon} />
              <HeroLink cta={secondaryCta} outline={secondaryVariant === "outline"} icon={secondaryIcon} />
            </motion.div>
            {extra ? <motion.div variants={item}>{extra}</motion.div> : null}
          </motion.div>

          <motion.div
            className={k.sceneCol}
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.05, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {scene}
          </motion.div>
        </div>

        {footer ? (
          <motion.div
            className={k.footer}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {footer}
          </motion.div>
        ) : null}
      </div>
    </section>
    </MotionConfig>
  );
}

/**
 * A fixed design-size canvas (width × height in px) scaled to the width of its
 * container. Layout height follows the aspect ratio, so nothing jumps.
 */
export type StageFocus = { x: number; y: number; w: number; h: number };

/** Below this width a stage with a `focus` crops to its key region instead of shrinking everything. */
export const STAGE_FOCUS_BELOW = 640;

export function ScaledStage({
  width,
  height,
  label,
  className,
  stageClassName,
  focus,
  children,
}: {
  width: number;
  height: number;
  label: string;
  className?: string;
  stageClassName?: string;
  /**
   * Phone layout: the region of the design (in design px) that is kept and
   * scaled up to the full width. Elements marked `data-mhide` are hidden.
   */
  focus?: StageFocus;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = window.matchMedia(`(max-width: ${STAGE_FOCUS_BELOW - 1}px)`);
    const update = () => {
      const phone = Boolean(focus) && mq.matches;
      setScale(el.clientWidth / (phone && focus ? focus.w : width));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    mq.addEventListener("change", update);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", update);
    };
  }, [width, focus?.w]);

  return (
    <section
      ref={ref}
      aria-label={label}
      data-focus={focus ? "" : undefined}
      className={cx(k.stageWrap, className)}
      style={
        {
          "--ar": `${width} / ${height}`,
          ...(focus
            ? { "--fx": focus.x, "--fy": focus.y, "--far": `${focus.w} / ${focus.h}` }
            : {}),
          ...(scale ? { "--k": scale } : {}),
        } as CSSProperties
      }
    >
      <div className={cx(k.stage, stageClassName)} style={{ width, height }}>
        {children}
      </div>
    </section>
  );
}

/** Rendered only below the phone breakpoint (CSS-only, hydration-safe). */
export function PhoneOnly({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx(k.phoneOnly, className)}>{children}</div>;
}

/** Hidden below the phone breakpoint (CSS-only, hydration-safe). */
export function NotPhone({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx(k.notPhone, className)}>{children}</div>;
}

/** Shared SVG defs (glow filter) for a scene's wire layer. */
export function WireDefs({ id }: { id: string }) {
  return (
    <defs>
      <filter id={`${id}-glow`} x="-200%" y="-200%" width="500%" height="500%">
        <feGaussianBlur stdDeviation="3" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

/**
 * A connector line with a soft pulse that travels along it and fades in/out
 * at the ends — no static end dots. Under reduced motion only the line stays.
 */
export function Wire({
  d,
  id,
  reduce,
  dur = 3.4,
  delay = 0,
  color = "rgb(108 184 255 / 0.5)",
  width = 1.3,
  dash,
  pulse = true,
}: {
  d: string;
  /** id prefix used for the glow filter from <WireDefs> */
  id: string;
  reduce: boolean;
  dur?: number;
  delay?: number;
  color?: string;
  width?: number;
  dash?: string;
  pulse?: boolean;
}) {
  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={dash}
      />
      {pulse && !reduce ? (
        <circle r="3.4" fill="#d8faff" filter={`url(#${id}-glow)`} opacity="0">
          <animateMotion dur={`${dur}s`} begin={`${-delay}s`} repeatCount="indefinite" path={d} />
          <animate
            attributeName="opacity"
            values="0;1;1;0"
            keyTimes="0;0.15;0.8;1"
            dur={`${dur}s`}
            begin={`${-delay}s`}
            repeatCount="indefinite"
          />
        </circle>
      ) : null}
    </g>
  );
}

export const heroKitStyles = k;
