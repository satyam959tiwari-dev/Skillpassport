"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { faqs } from "@/lib/content";
import { cx } from "@/lib/utils";

export function FaqAccordion() {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);
  const baseId = useId();

  return (
    <div className="mx-auto max-w-3xl divide-y divide-[var(--color-rule)] rounded-2xl border border-[var(--color-rule)] bg-white/[0.02]">
      {faqs.map((item) => {
        const open = openId === item.id;
        const panelId = `${baseId}-${item.id}-panel`;
        const buttonId = `${baseId}-${item.id}-button`;
        return (
          <div key={item.id}>
            <h3>
              <button
                id={buttonId}
                type="button"
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-lg font-medium text-white transition hover:bg-white/[0.03] sm:px-6"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenId(open ? null : item.id)}
              >
                {item.question}
                <ChevronDown
                  className={cx(
                    "size-5 shrink-0 text-[var(--color-sky)] transition",
                    open && "rotate-180",
                  )}
                  aria-hidden
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!open}
              className="px-5 pb-5 text-[var(--color-muted)] leading-relaxed sm:px-6"
            >
              {item.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
