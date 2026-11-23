"use client";

import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, ArrowRight, CheckCircle2, Copy, Loader2, Lock, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { contactTopics } from "@/lib/content";
import {
  CONTACT_LIMITS,
  validateContactField,
  validateContactInput,
  type ContactApiResponse,
  type ContactField,
  type ContactFieldErrors,
} from "@/lib/contact/schema";
import { cx } from "@/lib/utils";
import { CONTACT_TOPIC_EVENT } from "@/lib/contact-events";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/** Same-origin API by default; set NEXT_PUBLIC_CONTACT_ENDPOINT when the site is a static export. */
const ENDPOINT = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT || "/api/contact/";

type Fields = {
  name: string;
  email: string;
  organization: string;
  topic: string;
  subject: string;
  message: string;
  consent: boolean;
};

const initial: Fields = {
  name: "",
  email: "",
  organization: "",
  topic: "",
  subject: "",
  message: "",
  consent: false,
};

const ORDER: ContactField[] = ["name", "email", "organization", "topic", "subject", "message", "consent"];

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; reference: string; delivery: "sent" | "queued"; email: string }
  | { kind: "error"; message: string };

export function ContactForm() {
  const uid = useId();
  const reduce = usePrefersReducedMotion();
  const formRef = useRef<HTMLFormElement>(null);
  const [fields, setFields] = useState<Fields>(initial);
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<ContactField, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [honeypot, setHoneypot] = useState("");
  const startedAt = useRef<number>(0);
  const inFlight = useRef(false);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  // Route cards in the hero preselect the topic
  useEffect(() => {
    const on = (e: Event) => {
      const topic = (e as CustomEvent).detail as string;
      if (!contactTopics.some((t) => t.id === topic)) return;
      setFields((f) => ({ ...f, topic }));
      setErrors((er) => ({ ...er, topic: undefined }));
    };
    window.addEventListener(CONTACT_TOPIC_EVENT, on);
    return () => window.removeEventListener(CONTACT_TOPIC_EVENT, on);
  }, []);

  const id = (f: string) => `${uid}-${f}`;

  const setField = useCallback(
    <K extends keyof Fields>(key: K, value: Fields[K]) => {
      setFields((f) => ({ ...f, [key]: value }));
      // Live re-validation once the user has interacted with the field (or tried to submit)
      if (touched[key as ContactField] || submitted) {
        setErrors((e) => ({ ...e, [key]: validateContactField(key as ContactField, value) }));
      }
      if (status.kind === "error") setStatus({ kind: "idle" });
    },
    [touched, submitted, status.kind],
  );

  const onBlur = (key: ContactField) => {
    setTouched((t) => ({ ...t, [key]: true }));
    const value = fields[key as keyof Fields];
    // Don't nag about empty required fields on first blur-through; do validate anything typed.
    if (value === "" || value === false) {
      if (!submitted) return;
    }
    setErrors((e) => ({ ...e, [key]: validateContactField(key, value) }));
  };

  const focusFirstError = (errs: ContactFieldErrors) => {
    const first = ORDER.find((k) => errs[k]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (inFlight.current) return; // hard guard against double-submit
    setSubmitted(true);

    const local = validateContactInput(fields);
    if (!local.ok) {
      setErrors(local.fieldErrors);
      focusFirstError(local.fieldErrors);
      return;
    }
    setErrors({});

    inFlight.current = true;
    setStatus({ kind: "submitting" });
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20_000);

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...fields, website: honeypot, startedAt: startedAt.current }),
        signal: controller.signal,
      });
      let data: ContactApiResponse | null = null;
      try {
        data = (await res.json()) as ContactApiResponse;
      } catch {
        /* non-JSON (e.g. static host without the API) */
      }

      if (data?.ok) {
        setStatus({ kind: "success", reference: data.reference, delivery: data.delivery, email: local.data.email });
        setFields(initial);
        setTouched({});
        setSubmitted(false);
        return;
      }
      if (data && !data.ok && data.error === "validation" && data.fieldErrors) {
        setErrors(data.fieldErrors);
        focusFirstError(data.fieldErrors);
        setStatus({ kind: "error", message: data.message });
        return;
      }
      setStatus({
        kind: "error",
        message:
          data && !data.ok
            ? data.message
            : res.status === 404 || res.status === 405
              ? "The message service isn't available on this deployment yet. Please email us directly."
              : "Something went wrong while sending. Please try again.",
      });
    } catch (err) {
      setStatus({
        kind: "error",
        message:
          (err as Error)?.name === "AbortError"
            ? "The request timed out. Check your connection and try again."
            : "We couldn't reach the server. Check your connection and try again.",
      });
    } finally {
      window.clearTimeout(timeout);
      inFlight.current = false;
    }
  };

  const reset = () => {
    setStatus({ kind: "idle" });
    startedAt.current = Date.now();
    window.requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[name="name"]')?.focus());
  };

  const submitting = status.kind === "submitting";
  const msgLen = fields.message.trim().length;
  const fade = reduce
    ? {}
    : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -12 } };

  return (
    <div className="sp-glass relative overflow-hidden p-6 sm:p-8">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgb(98_172_250/0.7),transparent)]"
      />
      <AnimatePresence mode="wait" initial={false}>
        {status.kind === "success" ? (
          <motion.div key="success" {...fade} transition={{ duration: 0.35 }} role="status" aria-live="polite">
            <SuccessPanel
              reference={status.reference}
              delivery={status.delivery}
              email={status.email}
              onReset={reset}
              reduce={reduce}
            />
          </motion.div>
        ) : (
          <motion.form
            key="form"
            {...fade}
            transition={{ duration: 0.35 }}
            ref={formRef}
            onSubmit={onSubmit}
            noValidate
            aria-describedby={`${id("status")}`}
            aria-busy={submitting}
            className="space-y-5"
          >
            <div>
              <h3 className="text-xl font-semibold text-white">Send us a message</h3>
              <p className="mt-1 text-sm text-[var(--color-faint)]">
                Fields marked <span className="text-[var(--color-sky)]">*</span> are required.
              </p>
            </div>

            <div id={id("status")} aria-live="assertive">
              <AnimatePresence>
                {status.kind === "error" ? (
                  <motion.div
                    {...fade}
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-[rgb(255_120_140/0.4)] bg-[rgb(255_80_110/0.1)] px-4 py-3 text-sm text-[#ffd1d9]"
                  >
                    <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                    <span>{status.message}</span>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                id={id("name")}
                name="name"
                label="Full name"
                required
                value={fields.name}
                error={errors.name}
                maxLength={CONTACT_LIMITS.name.max}
                autoComplete="name"
                placeholder="Priya Sharma"
                onChange={(v) => setField("name", v)}
                onBlur={() => onBlur("name")}
                disabled={submitting}
              />
              <TextField
                id={id("email")}
                name="email"
                type="email"
                inputMode="email"
                label="Work email"
                required
                value={fields.email}
                error={errors.email}
                maxLength={CONTACT_LIMITS.email.max}
                autoComplete="email"
                placeholder="you@company.com"
                hint="We'll reply here and send you a copy."
                onChange={(v) => setField("email", v)}
                onBlur={() => onBlur("email")}
                disabled={submitting}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                id={id("organization")}
                name="organization"
                label="Organization"
                optional
                value={fields.organization}
                error={errors.organization}
                maxLength={CONTACT_LIMITS.organization.max}
                autoComplete="organization"
                placeholder="Company or institution"
                onChange={(v) => setField("organization", v)}
                onBlur={() => onBlur("organization")}
                disabled={submitting}
              />
              <FieldShell id={id("topic")} label="I'm reaching out about" required error={errors.topic}>
                <select
                  id={id("topic")}
                  name="topic"
                  value={fields.topic}
                  onChange={(e) => setField("topic", e.target.value)}
                  onBlur={() => onBlur("topic")}
                  disabled={submitting}
                  required
                  aria-required
                  aria-invalid={Boolean(errors.topic)}
                  aria-describedby={errors.topic ? `${id("topic")}-error` : undefined}
                  className={cx(inputClass(Boolean(errors.topic)), "appearance-none pr-10", !fields.topic && "text-[var(--color-faint)]")}
                >
                  <option value="" disabled>
                    Select a topic
                  </option>
                  {contactTopics.map((t) => (
                    <option key={t.id} value={t.id} className="bg-[#0b0a33] text-white">
                      {t.label}
                    </option>
                  ))}
                </select>
                <span aria-hidden className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-sky)]">
                  ▾
                </span>
              </FieldShell>
            </div>

            <TextField
              id={id("subject")}
              name="subject"
              label="Subject"
              required
              value={fields.subject}
              error={errors.subject}
              maxLength={CONTACT_LIMITS.subject.max}
              autoComplete="off"
              placeholder="e.g. Verifying credentials for our hiring team"
              onChange={(v) => setField("subject", v)}
              onBlur={() => onBlur("subject")}
              disabled={submitting}
            />

            <FieldShell
              id={id("message")}
              label="Message"
              required
              error={errors.message}
              aside={
                <span
                  className={cx(
                    "text-xs tabular-nums",
                    msgLen > CONTACT_LIMITS.message.max * 0.9 ? "text-[#ffb4c0]" : "text-[var(--color-faint)]",
                  )}
                  aria-live="polite"
                >
                  {msgLen < CONTACT_LIMITS.message.min
                    ? `${CONTACT_LIMITS.message.min - msgLen} more characters needed`
                    : `${msgLen.toLocaleString()} / ${CONTACT_LIMITS.message.max.toLocaleString()}`}
                </span>
              }
            >
              <textarea
                id={id("message")}
                name="message"
                rows={6}
                value={fields.message}
                maxLength={CONTACT_LIMITS.message.max + 200}
                onChange={(e) => setField("message", e.target.value)}
                onBlur={() => onBlur("message")}
                disabled={submitting}
                required
                aria-required
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? `${id("message")}-error` : undefined}
                placeholder="Tell us what you're looking for, your timeline, and anything we should know."
                className={cx(inputClass(Boolean(errors.message)), "min-h-[150px] resize-y leading-relaxed")}
              />
            </FieldShell>

            {/* Honeypot — invisible to people & assistive tech; bots fill it */}
            <div aria-hidden className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
              <label htmlFor={id("website")}>Website</label>
              <input
                id={id("website")}
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor={id("consent")}
                className={cx(
                  "group flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm transition",
                  errors.consent
                    ? "border-[rgb(255_120_140/0.5)] bg-[rgb(255_80_110/0.06)]"
                    : "border-[var(--color-rule)] bg-white/[0.02] hover:border-[rgb(98_172_250/0.4)]",
                )}
              >
                <input
                  id={id("consent")}
                  name="consent"
                  type="checkbox"
                  checked={fields.consent}
                  onChange={(e) => setField("consent", e.target.checked)}
                  onBlur={() => onBlur("consent")}
                  disabled={submitting}
                  aria-invalid={Boolean(errors.consent)}
                  aria-describedby={errors.consent ? `${id("consent")}-error` : undefined}
                  className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[#5224d4]"
                />
                <span className="text-[var(--color-muted)]">
                  I agree that SkillPassport may store this message and contact me about it.{" "}
                  <span className="text-[var(--color-sky)]">*</span>
                </span>
              </label>
              <FieldError id={`${id("consent")}-error`} message={errors.consent} />
            </div>

            <div className="flex flex-col-reverse gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-xs text-[var(--color-faint)]">
                <Lock className="size-3.5 text-[var(--color-sky)]" aria-hidden />
                Sent securely. We never share your details.
              </p>
              <button
                type="submit"
                className="sp-btn-primary group min-w-[190px] !rounded-xl disabled:cursor-wait disabled:opacity-80"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Sending…
                  </>
                ) : (
                  <>
                    Send message
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                  </>
                )}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function inputClass(invalid: boolean) {
  return cx(
    "w-full rounded-xl border bg-[rgb(5_7_28/0.7)] px-4 py-3 text-[15px] text-white placeholder:text-[#6f6b9e] outline-none transition",
    "focus:bg-[rgb(5_7_28/0.9)] focus:shadow-[0_0_0_3px_rgb(98_172_250/0.18),0_0_24px_rgb(98_172_250/0.15)] disabled:opacity-60",
    invalid
      ? "border-[rgb(255_120_140/0.65)] focus:border-[rgb(255_140_160/0.9)]"
      : "border-[var(--color-rule)] hover:border-[rgb(98_172_250/0.35)] focus:border-[var(--color-sky)]",
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <AnimatePresence initial={false}>
      {message ? (
        <motion.p
          id={id}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-2 flex items-center gap-1.5 overflow-hidden text-sm text-[#ffb4c0]"
        >
          <AlertCircle className="size-3.5 shrink-0" aria-hidden />
          {message}
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}

function FieldShell({
  id,
  label,
  required,
  optional,
  error,
  hint,
  aside,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  hint?: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-[#cfc9ff]">
          {label}
          {required ? (
            <span className="text-[var(--color-sky)]" aria-hidden>
              {" "}
              *
            </span>
          ) : null}
          {optional ? <span className="font-normal text-[var(--color-faint)]"> (optional)</span> : null}
        </label>
        {aside}
      </div>
      <div className="relative">{children}</div>
      {hint && !error ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-[var(--color-faint)]">
          {hint}
        </p>
      ) : null}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

function TextField({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  hint,
  type = "text",
  inputMode,
  autoComplete,
  placeholder,
  maxLength,
  required,
  optional,
  disabled,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  hint?: string;
  type?: string;
  inputMode?: "email" | "text";
  autoComplete?: string;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
}) {
  return (
    <FieldShell id={id} label={label} required={required} optional={optional} error={error} hint={hint}>
      <input
        id={id}
        name={name}
        type={type}
        inputMode={inputMode}
        value={value}
        maxLength={maxLength}
        autoComplete={autoComplete}
        placeholder={placeholder}
        spellCheck={type === "email" ? false : undefined}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        aria-required={required || undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={inputClass(Boolean(error))}
      />
    </FieldShell>
  );
}

function SuccessPanel({
  reference,
  delivery,
  email,
  onReset,
  reduce,
}: {
  reference: string;
  delivery: "sent" | "queued";
  email: string;
  onReset: () => void;
  reduce: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus(), []);

  return (
    <div className="flex flex-col items-center py-8 text-center sm:py-12">
      <motion.span
        initial={reduce ? false : { scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 16 }}
        className="relative flex size-20 items-center justify-center rounded-full border border-emerald-300/50 bg-emerald-400/10 text-emerald-300 shadow-[0_0_40px_rgb(52_211_153/0.35)]"
      >
        <CheckCircle2 className="size-10" aria-hidden />
        {!reduce && (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full border border-emerald-300/50"
            animate={{ scale: [1, 1.6], opacity: [0.7, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />
        )}
      </motion.span>
      <h3 ref={headingRef} tabIndex={-1} className="mt-6 text-2xl font-semibold text-white outline-none">
        Message received — thank you!
      </h3>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[var(--color-muted)]">
        {delivery === "sent" ? (
          <>
            We've sent a confirmation to <span className="text-white">{email}</span>. Our team usually replies within
            1–2 business days.
          </>
        ) : (
          <>Your message is safely saved and our team will reply to {email} within 1–2 business days.</>
        )}
      </p>
      <button
        type="button"
        onClick={() => {
          void navigator.clipboard?.writeText(reference).then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
          });
        }}
        className="mt-6 inline-flex items-center gap-2 rounded-full border border-[rgb(98_172_250/0.35)] bg-white/[0.04] px-4 py-2 text-sm text-[var(--color-muted)] transition hover:border-[rgb(98_172_250/0.7)]"
        aria-label={`Copy reference ${reference}`}
      >
        Reference <span className="font-mono text-[var(--color-sky)]">{reference}</span>
        <Copy className="size-3.5" aria-hidden />
        <span className="sr-only" aria-live="polite">
          {copied ? "Copied" : ""}
        </span>
        {copied ? <span className="text-xs text-emerald-300">Copied</span> : null}
      </button>
      <button type="button" onClick={onReset} className="sp-btn-ghost mt-6">
        <RotateCcw className="size-4" aria-hidden /> Send another message
      </button>
    </div>
  );
}
