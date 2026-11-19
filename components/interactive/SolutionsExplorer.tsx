"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { audiences } from "@/lib/content";
import { cx } from "@/lib/utils";
import type { AudienceId } from "@/types";

export function SolutionsExplorer() {
  const [active, setActive] = useState<AudienceId>("candidates");
  const reduce = useReducedMotion();
  const audience = audiences.find((a) => a.id === active) ?? audiences[0];

  return (
    <div>
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Solutions by audience"
      >
        {audiences.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={active === item.id}
            aria-controls={`panel-${item.id}`}
            className={cx(
              "rounded-full px-4 py-2.5 text-sm font-medium transition",
              active === item.id
                ? "bg-[var(--color-violet-hi)] text-white"
                : "bg-white/5 text-[var(--color-muted)] hover:bg-white/10",
            )}
            onClick={() => setActive(item.id)}
          >
            {item.title}
          </button>
        ))}
      </div>

      <div className="mt-8">
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
            className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]"
          >
            <div>
              <p className="sp-eyebrow mb-3">{audience.eyebrow}</p>
              <h3 className="sp-heading text-3xl sm:text-4xl">{audience.headline}</h3>
              <p className="mt-4 max-w-2xl text-[var(--color-muted)] leading-relaxed">
                {audience.summary}
              </p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {audience.benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="rounded-xl border border-[var(--color-rule)] bg-white/[0.03] px-4 py-3 text-sm text-[var(--color-muted)]"
                  >
                    {benefit}
                  </li>
                ))}
              </ul>
              <Link
                href={audience.href}
                className="sp-btn-primary mt-8 inline-flex items-center gap-1"
              >
                Open {audience.title} page
                <ChevronRight className="size-4" aria-hidden />
              </Link>
            </div>
            <div className="sp-panel p-6">
              <h4 className="text-sm font-medium tracking-[0.14em] text-[#bdb4ff]">
                PRODUCT CAPABILITIES
              </h4>
              <ul className="mt-5 space-y-3">
                {audience.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 border-b border-[var(--color-rule)] pb-3 text-[var(--color-muted)] last:border-0"
                  >
                    <span className="size-2 rounded-full bg-[var(--color-sky)] shadow-[0_0_10px_var(--color-blue)]" />
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
