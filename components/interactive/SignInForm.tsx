"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ChevronRight } from "lucide-react";

type Fields = {
  email: string;
  password: string;
};

const initial: Fields = { email: "", password: "" };

export function SignInForm() {
  const [fields, setFields] = useState<Fields>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!fields.email.trim()) next.email = "Enter an email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
      next.email = "Enter a valid email.";
    }
    if (!fields.password.trim()) next.password = "Enter a password.";
    else if (fields.password.trim().length < 6) {
      next.password = "Use at least 6 characters.";
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    setDone(false);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    setDone(true);
    setFields(initial);
  };

  return (
    <form className="sp-panel space-y-5 p-6 sm:p-8" onSubmit={onSubmit} noValidate>
      {done ? (
        <div
          className="rounded-xl border border-[var(--color-sky)]/40 bg-[rgb(16_113_250/0.1)] px-4 py-4"
          role="status"
          aria-live="polite"
        >
          <p className="font-medium text-white">Details look good.</p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Next, create your Skill Passport to set up your profile.
          </p>
          <Link
            href="/create-passport/"
            className="sp-btn-primary mt-4 inline-flex items-center gap-1"
          >
            Create Your Passport
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </div>
      ) : null}

      <div className="space-y-4">
        <label className="block text-sm text-[#bdb4ff]" htmlFor="signin-email">
          Email
          <input
            id="signin-email"
            type="email"
            autoComplete="email"
            value={fields.email}
            onChange={(e) => setFields((f) => ({ ...f, email: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-[var(--color-rule)] bg-field px-4 py-3 text-white outline-none focus:border-[var(--color-sky)]"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "signin-email-error" : undefined}
          />
          {errors.email ? (
            <span id="signin-email-error" className="mt-1 block text-sm text-[#ffb4b4]">
              {errors.email}
            </span>
          ) : null}
        </label>

        <label className="block text-sm text-[#bdb4ff]" htmlFor="signin-password">
          Password
          <input
            id="signin-password"
            type="password"
            autoComplete="current-password"
            value={fields.password}
            onChange={(e) => setFields((f) => ({ ...f, password: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-[var(--color-rule)] bg-field px-4 py-3 text-white outline-none focus:border-[var(--color-sky)]"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "signin-password-error" : undefined}
          />
          {errors.password ? (
            <span id="signin-password-error" className="mt-1 block text-sm text-[#ffb4b4]">
              {errors.password}
            </span>
          ) : null}
        </label>
      </div>

      <button type="submit" className="sp-btn-primary" disabled={loading} aria-busy={loading}>
        {loading ? "Checking…" : "Sign in"}
      </button>

      <p className="text-sm text-[var(--color-faint)]">
        New here?{" "}
        <Link href="/create-passport/" className="text-[var(--color-sky)] hover:underline">
          Sign up — Create Your Passport
        </Link>
      </p>
    </form>
  );
}
