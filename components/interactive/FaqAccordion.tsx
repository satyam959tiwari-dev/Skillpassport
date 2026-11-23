"use client";

import { useId, useState } from "react";
import {
  Bot,
  ChevronDown,
  CircuitBoard,
  ClipboardList,
  Layers,
  Mail,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { faqs } from "@/lib/content";
import { cx } from "@/lib/utils";

const faqIcons = [
  Layers,
  Users,
  Shield,
  ClipboardList,
  Sparkles,
  Bot,
  CircuitBoard,
  Mail,
] as const;

export function FaqAccordion() {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);
  const baseId = useId();

  return (
    <div className="mx-auto max-w-3xl">
      <p className="mb-8 text-center text-[var(--color-muted)]">
        Find quick answers to common questions about SkillPassport.
      </p>
      <div className="sp-glass divide-y divide-[var(--color-rule)] overflow-hidden">
        {faqs.map((item, i) => {
          const open = openId === item.id;
          const panelId = `${baseId}-${item.id}-panel`;
          const buttonId = `${baseId}-${item.id}-button`;
          const Icon = faqIcons[i % faqIcons.length];
          return (
            <div
              key={item.id}
              className={cx(
                "transition",
                open && "bg-[linear-gradient(90deg,rgb(98_172_250/0.08),transparent_55%)]",
              )}
            >
              <h3>
                <button
                  id={buttonId}
                  type="button"
                  className="flex w-full items-center gap-4 px-5 py-5 text-left transition hover:bg-white/[0.03] sm:px-6"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => setOpenId(open ? null : item.id)}
                >
                  <span
                    className={cx(
                      "sp-icon-tile !size-10 shrink-0",
                      open && "shadow-[0_0_22px_rgb(98_172_250/0.35)]",
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="flex-1 text-base font-medium text-white sm:text-lg">
                    {item.question}
                  </span>
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
                className="px-5 pb-5 pl-[4.5rem] text-[var(--color-muted)] leading-relaxed sm:px-6 sm:pl-[5.25rem]"
              >
                {item.answer}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
