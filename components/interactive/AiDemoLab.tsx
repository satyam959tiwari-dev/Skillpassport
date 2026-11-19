"use client";

import { useEffect, useRef, useState } from "react";
import { DemoJourneyStrip } from "@/components/interactive/DemoJourneyStrip";
import { useDemoActivity } from "@/hooks/useDemoActivity";
import { aiDemos, simulateAiDemo } from "@/lib/content";
import { cx } from "@/lib/utils";

type DemoId = (typeof aiDemos)[number]["id"];

const demoOwner: Record<string, string> = {
  "candidate-summary": "Candidate",
  "assessment-reco": "Candidate",
  rubric: "Reviewer",
  "form-builder": "Reviewer",
  "employer-query": "Employer",
  "admin-template": "Super Admin",
};

const journey = [
  {
    id: "candidate-summary" as const,
    label: "Summary",
    doNext: "Generate a candidate profile summary draft",
  },
  {
    id: "assessment-reco" as const,
    label: "Assessments",
    doNext: "Generate assessment suggestions from skills or a target job",
  },
  {
    id: "rubric" as const,
    label: "Rubric",
    doNext: "Generate a rubric draft from an imported assessment document",
  },
  {
    id: "form-builder" as const,
    label: "Form builder",
    doNext: "Generate a refined form layout preview",
  },
  {
    id: "employer-query" as const,
    label: "Employer query",
    doNext: "Run a good-practice query for hiring context",
  },
  {
    id: "admin-template" as const,
    label: "Admin template",
    doNext: "Generate a Super Admin assessment template draft",
  },
];

type Phase = "idle" | "pending" | "review" | "accepted" | "discarded";

export function AiDemoLab() {
  const [activeId, setActiveId] = useState<DemoId>(aiDemos[0].id);
  const [phase, setPhase] = useState<Phase>("idle");
  const [draft, setDraft] = useState("");
  const [accepted, setAccepted] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const { justHappened, activity, act, clearJust } = useDemoActivity();
  /** Monotonic request token — only the latest run may write results. */
  const requestRef = useRef(0);
  const demo = aiDemos.find((d) => d.id === activeId) ?? aiDemos[0];
  const pending = phase === "pending";

  useEffect(() => {
    return () => {
      requestRef.current += 1;
    };
  }, []);

  const select = (id: DemoId) => {
    requestRef.current += 1; // invalidate any in-flight run
    setActiveId(id);
    setPhase("idle");
    setDraft("");
    setAccepted(null);
    setNote(null);
    clearJust();
  };

  const run = async (mode: "generate" | "regenerate" = "generate") => {
    const token = ++requestRef.current;
    const targetId = demo.id;
    const targetTitle = demo.title;
    setPhase("pending");
    setAccepted(null);
    setNote(null);
    const result = simulateAiDemo(targetId);
    await new Promise((r) => setTimeout(r, result.latencyMs));
    if (token !== requestRef.current) return; // stale result — ignore
    setDraft(result.output);
    setNote(result.note);
    setPhase("review");
    act(
      mode === "regenerate"
        ? `Regenerated “${targetTitle}” draft (local example).`
        : `Generated “${targetTitle}” draft (local example).`,
      false,
    );
  };

  const accept = () => {
    setAccepted(draft);
    setPhase("accepted");
    act(`Accepted “${demo.title}” output.`);
  };

  const discard = () => {
    requestRef.current += 1;
    setDraft("");
    setAccepted(null);
    setPhase("discarded");
    act(`Discarded “${demo.title}” draft.`, false);
  };

  return (
    <div className="sp-panel overflow-hidden">
      <div className="border-b border-[var(--color-rule)] bg-black/20 px-4 py-3 sm:px-6">
        <p className="text-xs tracking-[0.16em] text-[var(--color-sky)] uppercase">
          Six AI capabilities
        </p>
        <p className="mt-1 text-sm text-[var(--color-faint)]">
          Each capability stands on its own — open any one. Responses are predefined local
          examples, not a live model.
        </p>
        <DemoJourneyStrip
          steps={journey}
          activeId={activeId}
          justHappened={justHappened}
          activity={activity}
          overviewHint="Six separate AI capabilities — pick any one to try."
          ariaLabel="AI capabilities"
          onSelect={(id) => select(id)}
        />
      </div>
      <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="flex flex-col gap-2" role="tablist" aria-label="AI demonstrations">
          {aiDemos.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={activeId === item.id}
              className={cx(
                "rounded-2xl border px-4 py-4 text-left transition",
                activeId === item.id
                  ? "border-[var(--color-violet-line)] bg-white/6"
                  : "border-transparent hover:bg-white/4",
              )}
              onClick={() => select(item.id)}
            >
              <span className="text-xs tracking-[0.14em] text-[var(--color-sky)] uppercase">
                {demoOwner[item.id] ?? "SkillPassport"}
              </span>
              <span className="mt-1 block font-medium text-white">{item.title}</span>
              <span className="mt-1 block text-sm text-[var(--color-faint)]">
                {item.description}
              </span>
            </button>
          ))}
        </div>

        <div>
          <p className="mb-4 rounded-lg border border-[var(--color-rule)] bg-[rgb(82_36_212/0.12)] px-3 py-2 text-sm text-[#d9d4ff]">
            Illustrative example using predefined local data. Not a live AI service.
          </p>
          <label className="block text-sm font-medium tracking-wide text-[#bdb4ff]">
            {demo.inputLabel}
          </label>
          <pre className="mt-2 overflow-x-auto rounded-xl border border-[var(--color-rule)] bg-black/30 p-4 text-sm leading-relaxed text-[var(--color-muted)] whitespace-pre-wrap">
            {demo.input}
          </pre>
          {phase === "idle" || phase === "pending" || phase === "discarded" ? (
            <button
              type="button"
              className="sp-btn-primary mt-5"
              onClick={() => void run("generate")}
              disabled={pending}
              aria-busy={pending}
            >
              {pending ? "Generating…" : "Generate"}
            </button>
          ) : null}

          <div className="mt-6" aria-live="polite">
            {pending ? (
              <p className="text-sm text-[var(--color-faint)]">Preparing a draft…</p>
            ) : null}

            {phase === "review" ? (
              <div>
                <label
                  htmlFor="ai-demo-output"
                  className="text-sm font-medium tracking-wide text-[#bdb4ff]"
                >
                  {demo.outputLabel} — editable
                </label>
                <textarea
                  id="ai-demo-output"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={Math.min(14, Math.max(6, draft.split("\n").length + 1))}
                  className="mt-2 w-full resize-y rounded-xl border border-[var(--color-sky)]/30 bg-[rgb(16_113_250/0.08)] p-4 text-sm leading-relaxed text-white outline-none focus:border-[var(--color-sky)]"
                />
                {note ? (
                  <p className="mt-2 text-sm text-[var(--color-faint)]">{note}</p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="sp-btn-primary"
                    onClick={accept}
                    disabled={!draft.trim()}
                  >
                    Accept
                  </button>
                  <button type="button" className="sp-btn-ghost" onClick={discard}>
                    Discard
                  </button>
                  <button
                    type="button"
                    className="sp-btn-ghost"
                    onClick={() => void run("regenerate")}
                  >
                    Regenerate
                  </button>
                </div>
              </div>
            ) : null}

            {phase === "accepted" && accepted ? (
              <div>
                <h4 className="text-sm font-medium tracking-wide text-[#bdb4ff]">
                  Accepted · {demo.outputLabel}
                </h4>
                <pre className="mt-2 overflow-x-auto rounded-xl border border-[var(--color-sky)]/30 bg-[rgb(16_113_250/0.08)] p-4 text-sm leading-relaxed text-[var(--color-muted)] whitespace-pre-wrap">
                  {accepted}
                </pre>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="sp-btn-ghost"
                    onClick={() => {
                      setDraft(accepted);
                      setPhase("review");
                    }}
                  >
                    Edit again
                  </button>
                  <button
                    type="button"
                    className="sp-btn-ghost"
                    onClick={() => void run("regenerate")}
                  >
                    Regenerate
                  </button>
                </div>
              </div>
            ) : null}

            {phase === "discarded" ? (
              <p className="text-sm text-[var(--color-faint)]">
                Draft discarded. Generate again whenever you like.
              </p>
            ) : null}

            {phase === "idle" ? (
              <p className="text-sm text-[var(--color-faint)]">
                Generate to see an editable draft for this scenario.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
