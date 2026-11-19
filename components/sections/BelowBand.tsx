"use client";

import { useEffect, useRef } from "react";

/** Preserves the original homepage `.below` scroll-reveal behavior. */
export function BelowBand({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const band = ref.current;
    if (!band || !("IntersectionObserver" in window)) return;
    band.classList.add("is-armed");
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        band.classList.add("is-shown");
        io.disconnect();
      },
      { threshold: 0.25 },
    );
    io.observe(band);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className="below" id="story">
      {children}
    </section>
  );
}
