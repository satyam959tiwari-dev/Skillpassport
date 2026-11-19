import { aiDemos } from "@/data/ai";

/** Deterministic mock responses for AI demonstrations. */
export function getAiDemoById(id: string) {
  const demo = aiDemos.find((item) => item.id === id);
  if (!demo) throw new Error(`Unknown AI demo: ${id}`);
  return demo;
}

export function simulateAiDemo(id: string): {
  output: string;
  note: string;
  latencyMs: number;
} {
  const demo = getAiDemoById(id);
  // Fixed latency per id so UI feedback feels intentional and deterministic.
  const latencyMs = 600 + (demo.id.length % 5) * 120;
  return {
    output: demo.output,
    note: demo.note,
    latencyMs,
  };
}

export interface ContactPayload {
  name: string;
  email: string;
  organization?: string;
  topic: string;
  message: string;
}

export function validateContact(payload: ContactPayload): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!payload.name.trim()) errors.name = "Please enter your name.";
  if (!payload.email.trim()) {
    errors.email = "Please enter your email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!payload.topic.trim()) errors.topic = "Select a topic.";
  if (!payload.message.trim()) {
    errors.message = "Please enter a message.";
  } else if (payload.message.trim().length < 20) {
    errors.message = "Please write at least 20 characters.";
  }
  return errors;
}

/** Demo-only submission: no network call. */
export async function submitContactDemo(payload: ContactPayload): Promise<{
  ok: true;
  reference: string;
}> {
  const errors = validateContact(payload);
  if (Object.keys(errors).length) {
    throw new Error("Validation failed");
  }
  await new Promise((resolve) => setTimeout(resolve, 900));
  const stamp = payload.email.trim().toLowerCase().slice(0, 3);
  return {
    ok: true,
    reference: `DEMO-${stamp.toUpperCase()}-${payload.topic.slice(0, 3).toUpperCase()}-0001`,
  };
}
