"use client";

import { FormEvent, useState } from "react";
import { contactTopics, submitContactDemo, validateContact } from "@/lib/content";

type Fields = {
  name: string;
  email: string;
  organization: string;
  topic: string;
  message: string;
};

const initial: Fields = {
  name: "",
  email: "",
  organization: "",
  topic: "",
  message: "",
};

export function ContactForm() {
  const [fields, setFields] = useState<Fields>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const nextErrors = validateContact(fields);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    setReference(null);
    try {
      const result = await submitContactDemo(fields);
      setReference(result.reference);
      setFields(initial);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="sp-panel space-y-5 p-6 sm:p-8" onSubmit={onSubmit} noValidate>
      <div className="rounded-xl border border-[var(--color-rule)] bg-[rgb(82_36_212/0.12)] px-4 py-3 text-sm text-[#d9d4ff]">
        Demo mode: this form validates your input and shows a simulated confirmation.
        It does not transmit a real inquiry.
      </div>

      {reference ? (
        <div
          className="rounded-xl border border-[var(--color-sky)]/40 bg-[rgb(16_113_250/0.1)] px-4 py-4"
          role="status"
          aria-live="polite"
        >
          <p className="font-medium text-white">Demo submission recorded locally.</p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Reference: <span className="text-[var(--color-sky)]">{reference}</span>. No message was sent.
          </p>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="name"
          label="Name"
          value={fields.name}
          error={errors.name}
          onChange={(value) => setFields((f) => ({ ...f, name: value }))}
          autoComplete="name"
          required
        />
        <Field
          id="email"
          label="Email"
          type="email"
          value={fields.email}
          error={errors.email}
          onChange={(value) => setFields((f) => ({ ...f, email: value }))}
          autoComplete="email"
          required
        />
      </div>

      <Field
        id="organization"
        label="Organization (optional)"
        value={fields.organization}
        onChange={(value) => setFields((f) => ({ ...f, organization: value }))}
        autoComplete="organization"
      />

      <div>
        <label htmlFor="topic" className="mb-2 block text-sm font-medium text-[#bdb4ff]">
          Topic <span className="text-[var(--color-sky)]">*</span>
        </label>
        <select
          id="topic"
          className="w-full rounded-xl border border-[var(--color-rule)] bg-[#05071c] px-4 py-3 text-white outline-none focus:border-[var(--color-sky)]"
          value={fields.topic}
          onChange={(e) => setFields((f) => ({ ...f, topic: e.target.value }))}
          aria-invalid={Boolean(errors.topic)}
          aria-describedby={errors.topic ? "topic-error" : undefined}
          required
        >
          <option value="">Select a topic</option>
          {contactTopics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.label}
            </option>
          ))}
        </select>
        {errors.topic ? (
          <p id="topic-error" className="mt-2 text-sm text-[#ffb4b4]">
            {errors.topic}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="message" className="mb-2 block text-sm font-medium text-[#bdb4ff]">
          Message <span className="text-[var(--color-sky)]">*</span>
        </label>
        <textarea
          id="message"
          rows={5}
          className="w-full resize-y rounded-xl border border-[var(--color-rule)] bg-[#05071c] px-4 py-3 text-white outline-none focus:border-[var(--color-sky)]"
          value={fields.message}
          onChange={(e) => setFields((f) => ({ ...f, message: e.target.value }))}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
          required
        />
        {errors.message ? (
          <p id="message-error" className="mt-2 text-sm text-[#ffb4b4]">
            {errors.message}
          </p>
        ) : null}
      </div>

      <button type="submit" className="sp-btn-primary" disabled={loading} aria-busy={loading}>
        {loading ? "Submitting demo…" : "Send demo inquiry"}
      </button>
    </form>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-[#bdb4ff]">
        {label}
        {required ? <span className="text-[var(--color-sky)]"> *</span> : null}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[var(--color-rule)] bg-[#05071c] px-4 py-3 text-white outline-none focus:border-[var(--color-sky)]"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        required={required}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm text-[#ffb4b4]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
