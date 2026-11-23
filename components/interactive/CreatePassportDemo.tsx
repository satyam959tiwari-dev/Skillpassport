"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  passportAssessmentOptions,
  passportCredentialOptions,
  passportDemoSteps,
  passportFeatureSlides,
  passportSkillOptions,
  verificationStatusCopy,
  type VerificationStatus,
} from "@/data/passport-demo";
import { seedFromPassport } from "@/lib/demo-bridge";
import { cx } from "@/lib/utils";

type PassportDraft = {
  fullName: string;
  role: string;
  location: string;
  summary: string;
  skills: string[];
  credentials: string[];
  verification: Record<string, VerificationStatus>;
  assessments: string[];
  publicShare: boolean;
};

const STORAGE_KEY = "skillpassport-demo-draft-v3";

const initial: PassportDraft = {
  fullName: "",
  role: "",
  location: "",
  summary: "",
  skills: [],
  credentials: [],
  verification: {},
  assessments: [],
  publicShare: false,
};

function completionScore(draft: PassportDraft) {
  let score = 0;
  if (draft.fullName.trim()) score += 15;
  if (draft.role.trim()) score += 12;
  if (draft.location.trim()) score += 5;
  if (draft.summary.trim().length >= 20) score += 16;
  if (draft.skills.length) score += 18;
  if (draft.credentials.length) score += 12;
  if (draft.credentials.some((id) => draft.verification[id] === "verified")) score += 10;
  if (draft.assessments.length) score += 8;
  if (draft.publicShare) score += 4;
  return Math.min(100, score);
}

function displayName(draft: PassportDraft) {
  return draft.fullName.trim() || "Your name";
}

export function CreatePassportDemo() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<PassportDraft>(initial);
  const [savedDemo, setSavedDemo] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hydrated, setHydrated] = useState(false);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          draft?: PassportDraft;
          saved?: boolean;
          step?: number;
        };
        if (parsed.draft) setDraft({ ...initial, ...parsed.draft });
        if (typeof parsed.saved === "boolean") setSavedDemo(parsed.saved);
        if (typeof parsed.step === "number") {
          setStep(Math.min(Math.max(parsed.step, 0), passportDemoSteps.length - 1));
        }
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ draft, saved: savedDemo, step }),
      );
    } catch {
      /* ignore */
    }
  }, [draft, savedDemo, step, hydrated]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    const id = window.setInterval(() => {
      setSlide((s) => (s + 1) % passportFeatureSlides.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, []);

  const score = useMemo(() => completionScore(draft), [draft]);
  const current = passportDemoSteps[step];
  const activeSlide = passportFeatureSlides[slide];
  const selectedSkills = passportSkillOptions.filter((s) => draft.skills.includes(s.id));

  const toggleSkill = (id: string) => {
    setDraft((d) => ({
      ...d,
      skills: d.skills.includes(id) ? d.skills.filter((s) => s !== id) : [...d.skills, id],
    }));
  };

  const toggleCredential = (id: string) => {
    setDraft((d) => {
      const next = d.credentials.includes(id)
        ? d.credentials.filter((c) => c !== id)
        : [...d.credentials, id];
      const verification = { ...d.verification };
      if (!next.includes(id)) delete verification[id];
      else if (!verification[id]) verification[id] = "not_submitted";
      return { ...d, credentials: next, verification };
    });
  };

  const setVerification = (id: string, status: VerificationStatus) => {
    setDraft((d) => ({
      ...d,
      verification: { ...d.verification, [id]: status },
    }));
  };

  const toggleAssessment = (id: string) => {
    setDraft((d) => ({
      ...d,
      assessments: d.assessments.includes(id)
        ? d.assessments.filter((a) => a !== id)
        : [...d.assessments, id],
    }));
  };

  const validateStep = () => {
    const next: Record<string, string> = {};
    if (step === 0) {
      if (!draft.fullName.trim()) next.fullName = "Add a display name.";
      if (!draft.role.trim()) next.role = "Add a role focus.";
    }
    if (step === 1 && draft.skills.length === 0) {
      next.skills = "Select at least one skill.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    if (!validateStep()) return;
    setSavedDemo(false);
    setStep((s) => Math.min(s + 1, passportDemoSteps.length - 1));
  };

  const goBack = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  };

  const finishDemo = () => {
    if (!validateStep()) return;
    const skillLabels = passportSkillOptions
      .filter((s) => draft.skills.includes(s.id))
      .map((s) => s.label);
    seedFromPassport({
      name: draft.fullName.trim() || "Aarav Sharma",
      role: draft.role.trim() || "Frontend engineer",
      skills: skillLabels.length ? skillLabels : ["React", "TypeScript"],
      summary:
        draft.summary.trim() ||
        "Building accessible product interfaces with React and TypeScript.",
    });
    setSavedDemo(true);
  };

  const resetDemo = () => {
    setDraft(initial);
    setStep(0);
    setSavedDemo(false);
    setErrors({});
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      data-passport-app
      className="passport-app relative grid min-h-[100svh] lg:grid-cols-[1fr_1fr]"
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background: `
            radial-gradient(55% 55% at 12% 30%, rgb(22 17 82 / 0.98) 0%, transparent 70%),
            radial-gradient(42% 48% at 88% 12%, rgb(16 113 250 / 0.2) 0%, transparent 62%),
            radial-gradient(38% 42% at 78% 78%, rgb(68 30 182 / 0.28) 0%, transparent 65%),
            linear-gradient(105deg, #090d33 0%, #090d33 42%, #0a0c38 68%, #0b0a33 100%)
          `,
        }}
      />

      {/* Live passport preview */}
      <aside className="relative z-10 hidden flex-col justify-between border-r border-[var(--color-rule)] p-8 xl:p-12 lg:flex">
        <Link href="/" className="inline-flex w-fit items-center">
          <Image
            src="/images/masterpiece-logo.png"
            alt="SkillPassport"
            width={180}
            height={46}
            className="h-10 w-auto"
            priority
          />
        </Link>

        <div className="mx-auto flex w-full max-w-[460px] flex-1 flex-col justify-center py-10">
          <p className="sp-eyebrow mb-4">Live passport preview</p>
          <h2 className="sp-heading text-[clamp(26px,2.4vw,34px)] text-white">
            {activeSlide.title}
          </h2>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[var(--color-muted)]">
            {activeSlide.body}
          </p>

          <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Passport stages">
            {passportFeatureSlides.map((item, i) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={i === slide}
                className={cx(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                  i === slide
                    ? "border-[var(--color-sky)] bg-[rgb(16_113_250/0.15)] text-white"
                    : "border-[var(--color-rule)] text-[var(--color-faint)] hover:bg-white/5",
                )}
                onClick={() => setSlide(i)}
              >
                {item.id === "passport"
                  ? "Profile"
                  : item.id === "credentials"
                    ? "Credentials"
                    : item.id === "assess"
                      ? "Assessments"
                      : "Share"}
              </button>
            ))}
          </div>

          <div className="mt-8">
            <PassportPreview draft={draft} score={score} skills={selectedSkills} />
          </div>
        </div>

      </aside>

      {/* Working form — same brand surfaces as the rest of the site */}
      <section className="relative z-10 flex min-h-[100svh] flex-col">
        <header className="flex items-center justify-between border-b border-[var(--color-rule)] px-5 py-4 sm:px-8">
          <Link href="/" className="inline-flex items-center gap-2 lg:hidden">
            <Image
              src="/images/skillpassport-logo.png"
              alt="SkillPassport"
              width={36}
              height={36}
              className="h-9 w-9"
            />
            <span className="text-sm font-medium text-white">SkillPassport</span>
          </Link>
          <p className="hidden text-sm text-[var(--color-faint)] sm:block">
            Step {step + 1} of {passportDemoSteps.length}
          </p>
          <Link href="/" className="sp-btn-ghost !min-h-0 !px-0 !py-0 text-sm">
            ← Back to site
          </Link>
        </header>

        <div className="mx-auto flex w-full max-w-[540px] flex-1 flex-col px-5 py-8 sm:px-8 sm:py-10">
          <div className="mb-6 flex gap-1.5" aria-hidden>
            {passportDemoSteps.map((item, i) => (
              <span
                key={item.id}
                className={cx(
                  "h-1 flex-1 rounded-full",
                  i <= step
                    ? "bg-gradient-to-r from-[var(--color-sky)] to-[var(--color-violet-hi)]"
                    : "bg-white/10",
                )}
              />
            ))}
          </div>

          <p className="sp-eyebrow">Create Your Passport</p>
          <h1 className="sp-heading mt-4 text-[clamp(28px,4vw,40px)] text-white">
            {current.title}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-muted)]">
            {current.description}
          </p>

          <div className="sp-panel mt-6 p-4 lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-white">{displayName(draft)}</p>
                <p className="text-sm text-[var(--color-faint)]">
                  {draft.role.trim() || "Role focus"} · Profile {score}%
                </p>
              </div>
              <span className="rounded-full bg-[rgb(16_113_250/0.15)] px-3 py-1 text-xs text-[var(--color-sky)]">
                Live preview
              </span>
            </div>
          </div>

          <div className="mt-8 flex-1 space-y-5">
            {step === 0 && (
              <>
                <Field
                  id="fullName"
                  label="Display name"
                  value={draft.fullName}
                  placeholder="e.g. Aarav Sharma"
                  error={errors.fullName}
                  onChange={(v) => setDraft((d) => ({ ...d, fullName: v }))}
                />
                <Field
                  id="role"
                  label="Role focus"
                  value={draft.role}
                  placeholder="e.g. Full-stack engineer"
                  error={errors.role}
                  onChange={(v) => setDraft((d) => ({ ...d, role: v }))}
                />
                <Field
                  id="location"
                  label="Location (optional)"
                  value={draft.location}
                  placeholder="e.g. Bengaluru"
                  onChange={(v) => setDraft((d) => ({ ...d, location: v }))}
                />
                <div>
                  <label
                    htmlFor="summary"
                    className="mb-2 block text-sm font-medium text-[#bdb4ff]"
                  >
                    Short summary (optional)
                  </label>
                  <textarea
                    id="summary"
                    rows={3}
                    value={draft.summary}
                    placeholder="A line or two about your focus…"
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, summary: e.target.value }))
                    }
                    className="w-full resize-y rounded-xl border border-[var(--color-rule)] bg-field px-4 py-3 text-white outline-none placeholder:text-[var(--color-faint)] focus:border-[var(--color-sky)]"
                  />
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <fieldset>
                  <legend className="mb-3 text-sm font-medium text-[#bdb4ff]">Skills</legend>
                  <div className="flex flex-wrap gap-2">
                    {passportSkillOptions.map((skill) => {
                      const on = draft.skills.includes(skill.id);
                      return (
                        <button
                          key={skill.id}
                          type="button"
                          aria-pressed={on}
                          onClick={() => toggleSkill(skill.id)}
                          className={cx(
                            "rounded-full border px-3.5 py-2 text-sm transition",
                            on
                              ? "border-[var(--color-sky)] bg-[rgb(16_113_250/0.15)] text-white"
                              : "border-[var(--color-rule)] text-[var(--color-muted)] hover:bg-white/5",
                          )}
                        >
                          {skill.label}
                        </button>
                      );
                    })}
                  </div>
                  {errors.skills ? (
                    <p className="mt-2 text-sm text-[#ffb4b4]">{errors.skills}</p>
                  ) : null}
                </fieldset>
                <fieldset>
                  <legend className="mb-3 text-sm font-medium text-[#bdb4ff]">
                    Credentials / documents
                  </legend>
                  <ul className="space-y-2">
                    {passportCredentialOptions.map((cred) => {
                      const on = draft.credentials.includes(cred.id);
                      return (
                        <li key={cred.id}>
                          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--color-rule)] bg-white/[0.03] px-4 py-3">
                            <input
                              type="checkbox"
                              className="mt-1"
                              checked={on}
                              onChange={() => toggleCredential(cred.id)}
                            />
                            <span>
                              <span className="block text-white">{cred.label}</span>
                              <span className="text-sm text-[var(--color-faint)]">
                                {cred.kind}
                              </span>
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </fieldset>
              </>
            )}

            {step === 2 && (
              <div className="space-y-3">
                {draft.credentials.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-[var(--color-rule)] bg-white/[0.03] px-4 py-5 text-sm text-[var(--color-muted)]">
                    No credentials yet. Go back to add documents, or continue anyway.
                  </p>
                ) : (
                  draft.credentials.map((id) => {
                    const cred = passportCredentialOptions.find((c) => c.id === id)!;
                    const status = draft.verification[id] ?? "not_submitted";
                    return (
                      <div
                        key={id}
                        className="rounded-xl border border-[var(--color-rule)] bg-white/[0.03] p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-medium text-white">{cred.label}</p>
                            <p className="text-sm text-[var(--color-faint)]">{cred.kind}</p>
                          </div>
                          <StatusPill status={status} />
                        </div>
                        <p className="mt-2 text-sm text-[var(--color-muted)]">
                          {verificationStatusCopy[status].hint}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(
                            [
                              "not_submitted",
                              "in_review",
                              "needs_info",
                              "verified",
                            ] as VerificationStatus[]
                          ).map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setVerification(id, s)}
                              className={cx(
                                "rounded-lg px-3 py-1.5 text-xs font-medium transition",
                                status === s
                                  ? "bg-[var(--color-violet-hi)] text-white"
                                  : "bg-white/5 text-[var(--color-muted)] hover:bg-white/10",
                              )}
                            >
                              {verificationStatusCopy[s].label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {step === 3 && (
              <ul className="space-y-2">
                {passportAssessmentOptions.map((item) => {
                  const on = draft.assessments.includes(item.id);
                  return (
                    <li key={item.id}>
                      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--color-rule)] bg-white/[0.03] px-4 py-3">
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={on}
                          onChange={() => toggleAssessment(item.id)}
                        />
                        <span>
                          <span className="block text-white">{item.label}</span>
                          <span className="text-sm text-[var(--color-faint)]">
                            {item.hint}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--color-rule)] bg-white/[0.03] px-4 py-3">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={draft.publicShare}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, publicShare: e.target.checked }))
                    }
                  />
                  <span>
                    <span className="block text-white">Allow public profile sharing</span>
                    <span className="text-sm text-[var(--color-faint)]">
                      Turn on a public profile link you can share.
                    </span>
                  </span>
                </label>

                <div className="sp-panel p-4">
                  <p className="text-xs font-medium tracking-[0.14em] text-[var(--color-sky)] uppercase">
                    Passport ready check
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-[var(--color-muted)]">
                    <li>Profile · {displayName(draft)}</li>
                    <li>Skills · {draft.skills.length || 0} selected</li>
                    <li>
                      Credentials ·{" "}
                      {draft.credentials.filter((id) => draft.verification[id] === "verified")
                        .length || 0}{" "}
                      verified
                    </li>
                    <li>Assessments · {draft.assessments.length || 0}</li>
                    <li>
                      Sharing · {draft.publicShare ? "Public" : "Private"}
                    </li>
                  </ul>
                </div>

                {savedDemo ? (
                  <div
                    className="rounded-xl border border-[var(--color-sky)]/40 bg-[rgb(16_113_250/0.1)] px-4 py-4"
                    role="status"
                  >
                    <p className="font-medium text-white">
                      Your passport preview is ready
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                      It stays in this browser tab until you refresh or close it.
                    </p>
                    <p className="mt-2 text-sm text-[var(--color-sky)]">
                      Open the candidate workspace to keep building it.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link href="/candidates/" className="sp-btn-primary">
                        Open candidate workspace
                      </Link>
                      <Link href="/contact/" className="sp-btn-ghost">
                        Contact us
                      </Link>
                      <button type="button" className="sp-btn-ghost" onClick={resetDemo}>
                        Start over
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-[var(--color-rule)] pt-6">
            {!savedDemo ? (
              <button
                type="button"
                onClick={goBack}
                disabled={step === 0}
                className="rounded-lg border border-[var(--color-rule)] px-4 py-2.5 text-sm text-[var(--color-muted)] transition hover:bg-white/5 disabled:opacity-40"
              >
                Back
              </button>
            ) : null}
            {step < passportDemoSteps.length - 1 ? (
              <button type="button" className="sp-btn-primary" onClick={goNext}>
                Continue <span aria-hidden>→</span>
              </button>
            ) : savedDemo ? (
              <p className="text-sm text-[var(--color-sky)]" role="status">
                Passport preview saved.
              </p>
            ) : (
              <button type="button" className="sp-btn-primary" onClick={finishDemo}>
                Preview my passport
              </button>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-[var(--color-faint)]">
            Already exploring?{" "}
            <Link
              href="/candidates/"
              className="text-[var(--color-sky)] hover:underline"
            >
              See candidate features
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-[#bdb4ff]">
        {label}
      </label>
      <input
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[var(--color-rule)] bg-field px-4 py-3 text-white outline-none placeholder:text-[var(--color-faint)] focus:border-[var(--color-sky)]"
        aria-invalid={Boolean(error)}
      />
      {error ? <p className="mt-2 text-sm text-[#ffb4b4]">{error}</p> : null}
    </div>
  );
}

function StatusPill({ status }: { status: VerificationStatus }) {
  const tone =
    status === "verified"
      ? "bg-[rgb(16_113_250/0.18)] text-[var(--color-sky)]"
      : status === "in_review"
        ? "bg-[rgb(82_36_212/0.25)] text-[#d9d4ff]"
        : status === "needs_info"
          ? "bg-[rgb(255_120_120/0.15)] text-[#ffb4b4]"
          : "bg-white/10 text-[var(--color-faint)]";
  return (
    <span className={cx("rounded-full px-3 py-1 text-xs font-medium", tone)}>
      {verificationStatusCopy[status].label}
    </span>
  );
}

/** Same visual language as homepage “Candidate passport view” panels — not a copied card UI. */
function PassportPreview({
  draft,
  score,
  skills,
}: {
  draft: PassportDraft;
  score: number;
  skills: Array<(typeof passportSkillOptions)[number]>;
}) {
  const verifiedCount = draft.credentials.filter(
    (id) => draft.verification[id] === "verified",
  ).length;
  const inReviewCount = draft.credentials.filter(
    (id) => draft.verification[id] === "in_review",
  ).length;

  const rows = [
    {
      label: "Profile strength",
      value: `${score}%`,
      detail:
        displayName(draft) === "Your name"
          ? "Add name and role to start the passport"
          : `${displayName(draft)}${draft.role.trim() ? ` · ${draft.role.trim()}` : ""}`,
    },
    {
      label: "Skills & experience",
      value: skills.length ? `${skills.length} selected` : "None yet",
      detail: skills.length
        ? skills
            .slice(0, 4)
            .map((s) => s.label)
            .join(" · ")
        : "Choose skills in the form",
    },
    {
      label: "Document status",
      value:
        draft.credentials.length === 0
          ? "No documents"
          : verifiedCount
            ? `${verifiedCount} verified`
            : inReviewCount
              ? `${inReviewCount} in review`
              : `${draft.credentials.length} attached`,
      detail: "Upload ≠ verified — status is tracked separately",
    },
    {
      label: "Assessments & reviews",
      value: draft.assessments.length
        ? `${draft.assessments.length} evidence item${draft.assessments.length === 1 ? "" : "s"}`
        : "Not started",
      detail: draft.assessments.length
        ? draft.assessments
            .map((id) => passportAssessmentOptions.find((a) => a.id === id)?.label)
            .filter(Boolean)
            .join(" · ")
        : "Prove skills with assessments and expert reviews",
    },
    {
      label: "Share visibility",
      value: draft.publicShare ? "Public" : "Private",
      detail: "Control whether the passport can be shared",
    },
  ];

  return (
    <div className="sp-panel overflow-hidden" aria-live="polite">
      <div className="relative overflow-hidden border-b border-[var(--color-rule)] bg-[radial-gradient(80%_120%_at_10%_0%,rgb(16_113_250/0.35),transparent_55%),linear-gradient(160deg,#120f47,#090d33)] px-5 py-5">
        <p className="text-[10px] tracking-[0.22em] text-[#bdb4ff] uppercase">
          Digital Skill Passport · Preview
        </p>
        <div className="mt-4 flex items-start gap-4">
          <div
            className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-lg font-medium text-white"
            aria-hidden
          >
            {displayName(draft).slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-xl font-medium text-white">{displayName(draft)}</h3>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {draft.role.trim() || "Role focus"}
              {draft.location.trim() ? ` · ${draft.location.trim()}` : ""}
            </p>
            {draft.summary.trim() ? (
              <p className="mt-2 line-clamp-2 text-sm text-[var(--color-faint)]">
                {draft.summary.trim()}
              </p>
            ) : null}
          </div>
          <div className="text-right">
            <p className="text-2xl font-medium text-white">{score}%</p>
            <p className="text-xs text-[var(--color-faint)]">Strength</p>
          </div>
        </div>
        <div
          className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={score}
          aria-label="Profile strength"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--color-sky)] to-[var(--color-violet-hi)] transition-[width] duration-500"
            style={{ width: `${Math.max(score, 4)}%` }}
          />
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {skills.length ? (
          <div className="mb-4 flex flex-wrap gap-2">
            {skills.slice(0, 6).map((skill) => (
              <span
                key={skill.id}
                className="rounded-full border border-[var(--color-rule)] bg-white/[0.04] px-2.5 py-1 text-xs text-[var(--color-muted)]"
              >
                {skill.label}
              </span>
            ))}
          </div>
        ) : null}

        <ul className="space-y-2">
          {rows.map((row) => (
            <li
              key={row.label}
              className="rounded-lg bg-white/[0.04] px-3 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-[var(--color-faint)]">{row.label}</p>
                <p className="shrink-0 text-sm text-[var(--color-sky)]">{row.value}</p>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-[var(--color-muted)]">
                {row.detail}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
