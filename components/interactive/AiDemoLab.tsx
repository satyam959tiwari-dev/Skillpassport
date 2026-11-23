"use client";

import { useEffect, useRef, useState } from "react";
import {
  Briefcase,
  Building2,
  Check,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Layers,
  Pencil,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useDemoActivity } from "@/hooks/useDemoActivity";
import { aiDemos, audiences, simulateAiDemo } from "@/lib/content";
import { AI_DEMO_EVENT } from "@/lib/ai-events";
import { cx } from "@/lib/utils";

type DemoId = (typeof aiDemos)[number]["id"];

const navMeta: Array<{
  id: DemoId;
  label: string;
  icon: typeof UserRound;
}> = [
  { id: "candidate-summary", label: "Candidate", icon: UserRound },
  { id: "assessment-reco", label: "AI Assessment", icon: GraduationCap },
  { id: "rubric", label: "AI Form Import", icon: FileText },
  { id: "form-builder", label: "AI Form Builder", icon: ClipboardCheck },
  { id: "employer-query", label: "Employer", icon: Briefcase },
  { id: "admin-template", label: "Super Admin", icon: Building2 },
];

const demoOwner: Record<string, string> = {
  "candidate-summary": "Candidate",
  "assessment-reco": "Candidate",
  rubric: "Reviewer",
  "form-builder": "Reviewer",
  "employer-query": "Employer",
  "admin-template": "Super Admin",
};

type Phase = "idle" | "pending" | "review" | "accepted" | "discarded";

/** Try AI Capabilities — 3-column layout matching AI Capabilities Dashboard mock. */
export function AiDemoLab() {
  const [activeId, setActiveId] = useState<DemoId>(aiDemos[0].id);
  const [phase, setPhase] = useState<Phase>("idle");
  const [draft, setDraft] = useState("");
  const [accepted, setAccepted] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const { act, clearJust } = useDemoActivity();
  const requestRef = useRef(0);
  const demo = aiDemos.find((d) => d.id === activeId) ?? aiDemos[0];
  const pending = phase === "pending";
  const capabilities = audiences[0]?.features ?? [];

  useEffect(() => {
    return () => {
      requestRef.current += 1;
    };
  }, []);

  const select = (id: DemoId) => {
    requestRef.current += 1;
    setActiveId(id);
    setPhase("idle");
    setDraft("");
    setAccepted(null);
    setNote(null);
    clearJust();
  };

  // Hero tiles / capability cards open a specific example here
  const selectRef = useRef(select);
  selectRef.current = select;
  useEffect(() => {
    const on = (e: Event) => {
      const id = (e as CustomEvent).detail as string;
      if (aiDemos.some((d) => d.id === id)) selectRef.current(id as DemoId);
    };
    window.addEventListener(AI_DEMO_EVENT, on);
    return () => window.removeEventListener(AI_DEMO_EVENT, on);
  }, []);

  const run = async (mode: "generate" | "regenerate" = "generate") => {
    const token = ++requestRef.current;
    const targetId = demo.id;
    const targetTitle = demo.title;
    setPhase("pending");
    setAccepted(null);
    setNote(null);
    const result = simulateAiDemo(targetId);
    await new Promise((r) => setTimeout(r, result.latencyMs));
    if (token !== requestRef.current) return;
    setDraft(result.output);
    setNote(result.note);
    setPhase("review");
    act(
      mode === "regenerate"
        ? `Regenerated “${targetTitle}” draft.`
        : `Generated “${targetTitle}” draft.`,
      false,
    );
  };

  return (
    <div className="overflow-hidden rounded-[20px] border border-[rgb(98_172_250/0.2)] bg-[linear-gradient(165deg,rgb(18_22_70/0.88),rgb(9_13_51/0.82))] backdrop-blur-xl">
      <div className="border-b border-[var(--color-rule)] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-[var(--color-sky)]" aria-hidden />
          <p className="text-xs tracking-[0.16em] text-[var(--color-sky)] uppercase">
            Try AI capabilities
          </p>
        </div>
        <p className="mt-1 text-sm text-[var(--color-faint)]">
          See how AI helps each role — and where people stay in control.
        </p>
      </div>

      <div className="grid lg:grid-cols-[0.7fr_1.35fr_0.85fr]">
        {/* Left nav */}
        <div
          className="flex flex-col gap-1.5 border-b border-[var(--color-rule)] p-3 lg:border-r lg:border-b-0"
          role="tablist"
          aria-label="AI capabilities by role"
        >
          {navMeta.map(({ id, label, icon: Icon }) => {
            const selected = activeId === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={selected}
                className={cx(
                  "inline-flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm transition",
                  selected
                    ? "border-[var(--color-violet-line)] bg-[linear-gradient(135deg,rgb(82_36_212/0.45),rgb(16_113_250/0.2))] text-white shadow-[0_0_20px_rgb(82_36_212/0.3)]"
                    : "border-transparent text-[var(--color-muted)] hover:bg-white/[0.04] hover:text-white",
                )}
                onClick={() => select(id)}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                {label}
              </button>
            );
          })}
        </div>

        {/* Center workspace */}
        <div className="border-b border-[var(--color-rule)] p-4 sm:p-5 lg:border-r lg:border-b-0">
          <p className="text-[10px] tracking-[0.16em] text-[#bdb4ff] uppercase">
            {demoOwner[demo.id] ?? "SkillPassport"}
          </p>
          <h3 className="mt-1 text-xl font-semibold text-white">{demo.title}</h3>
          <p className="mt-1.5 text-sm text-[var(--color-faint)]">{demo.description}</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
            <div className="rounded-xl border border-[var(--color-rule)] bg-inset-strong p-3">
              <p className="text-xs font-medium text-[#bdb4ff]">{demo.inputLabel}</p>
              <pre className="mt-2 max-h-36 overflow-auto text-xs leading-relaxed whitespace-pre-wrap text-[var(--color-muted)]">
                {demo.input}
              </pre>
            </div>
            <div className="hidden items-center justify-center sm:flex" aria-hidden>
              <span className="text-[var(--color-sky)]">→</span>
            </div>
            <div
              className={cx(
                "rounded-xl border p-3",
                phase === "review" || phase === "accepted"
                  ? "border-[rgb(106_70_232/0.55)] bg-[rgb(82_36_212/0.12)] shadow-[0_0_24px_rgb(106_70_232/0.2)]"
                  : "border-[var(--color-rule)] bg-inset",
              )}
            >
              <p className="inline-flex items-center gap-1.5 text-xs font-medium text-[#bdb4ff]">
                <Sparkles className="size-3.5" aria-hidden />
                {demo.outputLabel}
              </p>
              {pending ? (
                <p className="mt-2 text-xs text-[var(--color-faint)]">Preparing a draft…</p>
              ) : phase === "review" ? (
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={6}
                  className="mt-2 w-full resize-y rounded-lg border border-[var(--color-rule)] bg-inset-strong p-2.5 text-xs leading-relaxed text-white outline-none focus:border-[var(--color-sky)]"
                  aria-label={demo.outputLabel}
                />
              ) : phase === "accepted" && accepted ? (
                <pre className="mt-2 max-h-36 overflow-auto text-xs leading-relaxed whitespace-pre-wrap text-[var(--color-muted)]">
                  {accepted}
                </pre>
              ) : (
                <p className="mt-2 text-xs text-[var(--color-faint)]">
                  Press Generate to see the AI draft here.
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="sp-btn-primary inline-flex items-center gap-1.5 !min-h-0 !px-4 !py-2.5 !text-sm"
              onClick={() => void run(phase === "review" || phase === "accepted" ? "regenerate" : "generate")}
              disabled={pending}
              aria-busy={pending}
            >
              <Sparkles className="size-3.5" aria-hidden />
              {pending ? "Generating…" : "Generate with AI"}
            </button>
            {phase === "review" ? (
              <>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-rule)] px-3 py-2 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-sky)] hover:text-white"
                  onClick={() => {
                    setAccepted(draft);
                    setPhase("accepted");
                    act(`Accepted “${demo.title}” output.`);
                  }}
                  disabled={!draft.trim()}
                >
                  <Pencil className="size-3.5" aria-hidden />
                  Accept draft
                </button>
                <button
                  type="button"
                  className="rounded-lg px-3 py-2 text-sm text-[var(--color-faint)] hover:text-white"
                  onClick={() => {
                    requestRef.current += 1;
                    setDraft("");
                    setAccepted(null);
                    setPhase("discarded");
                    act(`Discarded “${demo.title}” draft.`, false);
                  }}
                >
                  Discard
                </button>
              </>
            ) : null}
          </div>
          {note && phase === "review" ? (
            <p className="mt-2 text-xs text-[var(--color-faint)]">{note}</p>
          ) : null}
        </div>

        {/* Right capabilities — compact, synced height */}
        <div className="p-3 sm:p-4">
          <div className="mb-2 flex items-center gap-2">
            <Layers className="size-3.5 text-[var(--color-sky)]" aria-hidden />
            <p className="text-[10px] tracking-[0.14em] text-[#bdb4ff] uppercase">
              Product capabilities
            </p>
          </div>
          <ul className="space-y-0 divide-y divide-[var(--color-rule)]">
            {capabilities.slice(0, 8).map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2 py-2 text-xs leading-snug text-[var(--color-muted)]"
              >
                <span className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-[rgb(106_70_232/0.25)] text-[#c4b5fd]">
                  <Check className="size-2.5" aria-hidden />
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
