"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { aiCapabilities, aiShowcase, type AiShowcaseRole } from "@/lib/content";
import { AI_AUDIENCE_EVENT, openAiDemo, setAiAudience } from "@/lib/ai-events";
import { cx } from "@/lib/utils";

const roleLabel: Record<AiShowcaseRole, string> = {
  candidate: "Candidates",
  reviewer: "Reviewers",
  employer: "Employers",
  admin: "Admins",
};

/** "Six capabilities" grid on /ai — follows the hero's audience filter and opens each local demo. */
export function AiCapabilityGrid() {
  const [role, setRole] = useState<AiShowcaseRole | null>(null);

  useEffect(() => {
    const on = (e: Event) => setRole(((e as CustomEvent).detail as AiShowcaseRole | null) ?? null);
    window.addEventListener(AI_AUDIENCE_EVENT, on);
    return () => window.removeEventListener(AI_AUDIENCE_EVENT, on);
  }, []);

  return (
    <>
      {role ? (
        <p className="mt-6 flex flex-wrap items-center gap-3 text-sm text-[var(--color-muted)]" aria-live="polite">
          Highlighting capabilities for <span className="text-white">{roleLabel[role]}</span>
          <button
            type="button"
            className="rounded-full border border-[rgb(98_172_250/0.4)] px-3 py-1 text-xs text-[var(--color-sky)] transition hover:border-[var(--color-sky)] hover:text-white"
            onClick={() => {
              setRole(null);
              setAiAudience(null);
            }}
          >
            Show all
          </button>
        </p>
      ) : null}
      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {aiCapabilities.map((item, i) => {
          const show = aiShowcase[i];
          const dim = role !== null && show?.role !== role;
          return (
            <article
              key={item.id}
              className={cx(
                "sp-panel flex flex-col p-6 transition duration-300 hover:-translate-y-1 hover:border-[rgb(98_172_250/0.55)]",
                dim && "opacity-40 saturate-50",
                role !== null && !dim && "border-[rgb(98_172_250/0.55)] shadow-[0_0_28px_rgb(51_135_242/0.18)]",
              )}
            >
              <p className="text-xs tracking-[0.14em] text-[var(--color-sky)] uppercase">
                {String(i + 1).padStart(2, "0")} · {item.owner}
              </p>
              <h3 className="mt-2 text-xl font-medium text-white">{item.title}</h3>
              <p className="mt-1 text-xs text-[var(--color-faint)]">{item.where}</p>
              <p className="mt-3 text-sm font-medium leading-relaxed text-white/90">{item.message}</p>
              <p className="mt-2 flex-1 text-[var(--color-muted)] leading-relaxed">{item.description}</p>
              {show ? (
                <button
                  type="button"
                  className="mt-5 inline-flex items-center gap-2 self-start text-sm font-medium text-[var(--color-sky)] transition hover:text-white"
                  onClick={() => openAiDemo(show.demoId)}
                >
                  Try it <ArrowRight className="size-4" aria-hidden />
                </button>
              ) : null}
            </article>
          );
        })}
      </div>
    </>
  );
}
