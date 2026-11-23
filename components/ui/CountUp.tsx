"use client";

import { useEffect, useState } from "react";
import { useInViewOnce } from "@/hooks/useInViewOnce";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type Props = {
  /** Final integer to count toward */
  target: number;
  /** Shown after the number, e.g. `+` or `%` */
  suffix?: string;
  /** Full static fallback (also used for a11y) */
  value: string;
  className?: string;
  /** Animation length in ms */
  duration?: number;
  /** Stagger start delay in ms */
  delay?: number;
};

function formatInt(n: number) {
  return Math.round(n).toLocaleString("en-US");
}

/**
 * Counts up once when the element first enters the viewport.
 * Respects prefers-reduced-motion (shows final value immediately).
 */
export function CountUp({
  target,
  suffix = "",
  value,
  className,
  duration = 1600,
  delay = 0,
}: Props) {
  const { ref, shown } = useInViewOnce<HTMLSpanElement>(0.35);
  const reduce = usePrefersReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : `0${suffix}`);

  useEffect(() => {
    if (!shown) return;
    if (reduce) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    let startAt = 0;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      if (!startAt) startAt = now + delay;
      const elapsed = now - startAt;
      if (elapsed < 0) {
        frame = requestAnimationFrame(tick);
        return;
      }
      const t = Math.min(1, elapsed / duration);
      setDisplay(`${formatInt(target * easeOut(t))}${suffix}`);
      if (t < 1) frame = requestAnimationFrame(tick);
      else setDisplay(value);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [shown, reduce, target, suffix, value, duration, delay]);

  return (
    <span ref={ref} className={className} aria-label={value}>
      {display}
    </span>
  );
}
