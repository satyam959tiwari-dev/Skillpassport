import { z } from "zod";
import { contactTopics } from "@/data/pages";

/**
 * Single source of truth for the contact form — imported by the client form
 * (instant inline validation) and by the API route (authoritative validation).
 */

export const CONTACT_LIMITS = {
  name: { min: 2, max: 80 },
  email: { max: 254 },
  organization: { max: 120 },
  subject: { min: 4, max: 140 },
  message: { min: 20, max: 4000 },
  maxLinks: 5,
} as const;

export type ContactTopicId = (typeof contactTopics)[number]["id"];

const topicIds = contactTopics.map((t) => t.id) as [ContactTopicId, ...ContactTopicId[]];

/** Remove control characters (keeps \n and \t), normalise unicode + newlines. */
function clean(value: string) {
  return value
    .normalize("NFKC")
    .replace(/\r\n?/g, "\n")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, "")
    .trim();
}

/** Single-line fields: collapse all whitespace (blocks header injection via \r\n). */
function oneLine(value: string) {
  return clean(value).replace(/\s+/g, " ");
}

const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M}\s.'’-]*$/u;
const LINK_RE = /(https?:\/\/|www\.)/gi;

export const contactSchema = z.object({
  name: z
    .string({ error: "Please enter your name." })
    .transform(oneLine)
    .pipe(
      z
        .string()
        .min(CONTACT_LIMITS.name.min, "Please enter your full name (at least 2 characters).")
        .max(CONTACT_LIMITS.name.max, `Name must be ${CONTACT_LIMITS.name.max} characters or fewer.`)
        .regex(NAME_RE, "Name can only contain letters, spaces, apostrophes, dots and hyphens."),
    ),
  email: z
    .string({ error: "Please enter your email address." })
    .transform((v) => oneLine(v).toLowerCase())
    .pipe(
      z
        .string()
        .min(1, "Please enter your email address.")
        .max(CONTACT_LIMITS.email.max, "Email address is too long.")
        .pipe(z.email("Please enter a valid email address, e.g. you@company.com.")),
    ),
  organization: z
    .string()
    .optional()
    .default("")
    .transform(oneLine)
    .pipe(
      z
        .string()
        .max(
          CONTACT_LIMITS.organization.max,
          `Organization must be ${CONTACT_LIMITS.organization.max} characters or fewer.`,
        ),
    ),
  topic: z.enum(topicIds, { error: "Please choose what your message is about." }),
  subject: z
    .string({ error: "Please add a subject." })
    .transform(oneLine)
    .pipe(
      z
        .string()
        .min(CONTACT_LIMITS.subject.min, "Please add a short subject (at least 4 characters).")
        .max(CONTACT_LIMITS.subject.max, `Subject must be ${CONTACT_LIMITS.subject.max} characters or fewer.`),
    ),
  message: z
    .string({ error: "Please write a message." })
    .transform((v) => clean(v).replace(/\n{3,}/g, "\n\n"))
    .pipe(
      z
        .string()
        .min(
          CONTACT_LIMITS.message.min,
          `Please share a bit more detail (at least ${CONTACT_LIMITS.message.min} characters).`,
        )
        .max(CONTACT_LIMITS.message.max, `Message must be ${CONTACT_LIMITS.message.max} characters or fewer.`)
        .refine(
          (v) => (v.match(LINK_RE)?.length ?? 0) <= CONTACT_LIMITS.maxLinks,
          `Please include no more than ${CONTACT_LIMITS.maxLinks} links.`,
        ),
    ),
  consent: z.literal(true, { error: "Please confirm we may contact you about this message." }),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactData = z.output<typeof contactSchema>;
export type ContactField = keyof ContactData;
export type ContactFieldErrors = Partial<Record<ContactField, string>>;

/** First error message per field (what the UI shows inline). */
export function toFieldErrors(error: z.ZodError): ContactFieldErrors {
  const out: ContactFieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as ContactField | undefined;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

export function validateContactInput(input: unknown) {
  const result = contactSchema.safeParse(input);
  return result.success
    ? ({ ok: true, data: result.data } as const)
    : ({ ok: false, fieldErrors: toFieldErrors(result.error) } as const);
}

/** Validate a single field (blur / live re-validation in the form). */
export function validateContactField(field: ContactField, value: unknown): string | undefined {
  const shape = contactSchema.shape[field];
  const result = shape.safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
}

export function topicLabel(id: string) {
  return contactTopics.find((t) => t.id === id)?.label ?? id;
}

/** Shape of the JSON the API returns. */
export type ContactApiResponse =
  | { ok: true; reference: string; delivery: "sent" | "queued" }
  | {
      ok: false;
      error: "validation" | "rate_limited" | "bad_request" | "forbidden" | "server_error";
      message: string;
      fieldErrors?: ContactFieldErrors;
      retryAfter?: number;
    };
