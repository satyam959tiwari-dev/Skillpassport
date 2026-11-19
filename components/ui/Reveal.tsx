"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useInViewOnce } from "@/hooks/useInViewOnce";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cx } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
};

export function Reveal({ children, className }: Props) {
  const { ref, shown } = useInViewOnce<HTMLDivElement>(0.18);
  const reduce = usePrefersReducedMotion();
  // Avoid hydration mismatch: only apply hide/show motion after mount
  // (matchMedia / IntersectionObserver are client-only).
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const hideForMotion = mounted && !reduce && !shown;

  return (
    <div
      ref={ref}
      className={cx(
        "transition duration-700 ease-out",
        hideForMotion && "translate-y-3 opacity-0",
        (!hideForMotion) && "translate-y-0 opacity-100",
        className,
      )}
    >
      {children}
    </div>
  );
}
