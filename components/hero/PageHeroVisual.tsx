"use client";

import { cx } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export type HeroVisualVariant =
  | "candidates"
  | "employers"
  | "verifiers"
  | "reviewers"
  | "enterprises"
  | "ai"
  | "trust"
  | "contact";

const scenes: Record<
  HeroVisualVariant,
  {
    title: string;
    nodes: Array<{ id: string; label: string; x: number; y: number; hub?: boolean }>;
    edges: Array<[string, string]>;
    badge: string;
  }
> = {
  candidates: {
    title: "Verified skill identity",
    badge: "Passport graph",
    nodes: [
      { id: "you", label: "You", x: 50, y: 48, hub: true },
      { id: "skills", label: "Skills", x: 22, y: 28 },
      { id: "creds", label: "Credentials", x: 78, y: 26 },
      { id: "assess", label: "Assessments", x: 18, y: 72 },
      { id: "review", label: "Reviews", x: 82, y: 70 },
      { id: "trust", label: "Trust", x: 50, y: 18 },
    ],
    edges: [
      ["you", "skills"],
      ["you", "creds"],
      ["you", "assess"],
      ["you", "review"],
      ["skills", "trust"],
      ["creds", "trust"],
    ],
  },
  employers: {
    title: "Evidence-led shortlist",
    badge: "Hiring signals",
    nodes: [
      { id: "role", label: "Role", x: 50, y: 20, hub: true },
      { id: "a", label: "Candidate A", x: 22, y: 55 },
      { id: "b", label: "Candidate B", x: 50, y: 72, hub: true },
      { id: "c", label: "Candidate C", x: 78, y: 55 },
      { id: "v", label: "Verified", x: 35, y: 38 },
      { id: "s", label: "Skills fit", x: 65, y: 38 },
    ],
    edges: [
      ["role", "v"],
      ["role", "s"],
      ["v", "a"],
      ["v", "b"],
      ["s", "b"],
      ["s", "c"],
      ["b", "a"],
      ["b", "c"],
    ],
  },
  verifiers: {
    title: "Credential workflow",
    badge: "Verification queue",
    nodes: [
      { id: "req", label: "Request", x: 18, y: 50, hub: true },
      { id: "docs", label: "Docs", x: 42, y: 28 },
      { id: "check", label: "Check", x: 58, y: 68, hub: true },
      { id: "status", label: "Status", x: 78, y: 36 },
      { id: "out", label: "Outcome", x: 88, y: 70 },
    ],
    edges: [
      ["req", "docs"],
      ["req", "check"],
      ["docs", "check"],
      ["check", "status"],
      ["check", "out"],
      ["status", "out"],
    ],
  },
  reviewers: {
    title: "Rubric & judgment",
    badge: "Expert review",
    nodes: [
      { id: "task", label: "Assessment", x: 20, y: 40 },
      { id: "rubric", label: "Rubric", x: 48, y: 22, hub: true },
      { id: "evidence", label: "Evidence", x: 48, y: 78 },
      { id: "score", label: "Score", x: 78, y: 40, hub: true },
      { id: "notes", label: "Notes", x: 78, y: 68 },
    ],
    edges: [
      ["task", "rubric"],
      ["task", "evidence"],
      ["rubric", "score"],
      ["evidence", "score"],
      ["score", "notes"],
    ],
  },
  enterprises: {
    title: "Org trust map",
    badge: "Governance",
    nodes: [
      { id: "org", label: "Org", x: 50, y: 48, hub: true },
      { id: "admin", label: "Admins", x: 22, y: 28 },
      { id: "teams", label: "Teams", x: 78, y: 28 },
      { id: "verify", label: "Verify", x: 22, y: 72 },
      { id: "hire", label: "Hire", x: 78, y: 72 },
      { id: "policy", label: "Policy", x: 50, y: 18 },
    ],
    edges: [
      ["org", "admin"],
      ["org", "teams"],
      ["org", "verify"],
      ["org", "hire"],
      ["policy", "admin"],
      ["policy", "teams"],
      ["verify", "hire"],
    ],
  },
  ai: {
    title: "Human-in-the-loop AI",
    badge: "Assistive layer",
    nodes: [
      { id: "ai", label: "AI draft", x: 28, y: 48, hub: true },
      { id: "human", label: "Human", x: 72, y: 48, hub: true },
      { id: "sum", label: "Summary", x: 28, y: 22 },
      { id: "rub", label: "Rubric", x: 28, y: 78 },
      { id: "decide", label: "Decision", x: 72, y: 22 },
      { id: "audit", label: "Audit", x: 72, y: 78 },
    ],
    edges: [
      ["ai", "sum"],
      ["ai", "rub"],
      ["ai", "human"],
      ["human", "decide"],
      ["human", "audit"],
      ["sum", "decide"],
    ],
  },
  trust: {
    title: "Inspectable trust",
    badge: "Governance ring",
    nodes: [
      { id: "core", label: "Trust", x: 50, y: 50, hub: true },
      { id: "v", label: "Verify", x: 50, y: 18 },
      { id: "g", label: "Govern", x: 82, y: 42 },
      { id: "a", label: "Account", x: 70, y: 78 },
      { id: "h", label: "Human", x: 30, y: 78 },
      { id: "r", label: "Roles", x: 18, y: 42 },
    ],
    edges: [
      ["core", "v"],
      ["core", "g"],
      ["core", "a"],
      ["core", "h"],
      ["core", "r"],
      ["v", "g"],
      ["g", "a"],
      ["a", "h"],
      ["h", "r"],
      ["r", "v"],
    ],
  },
  contact: {
    title: "Talk to the team",
    badge: "Conversation map",
    nodes: [
      { id: "you", label: "You", x: 22, y: 50, hub: true },
      { id: "topic", label: "Topic", x: 50, y: 28 },
      { id: "msg", label: "Message", x: 50, y: 72 },
      { id: "team", label: "Team", x: 78, y: 50, hub: true },
    ],
    edges: [
      ["you", "topic"],
      ["you", "msg"],
      ["topic", "team"],
      ["msg", "team"],
    ],
  },
};

type Props = {
  variant: HeroVisualVariant;
  className?: string;
};

export function PageHeroVisual({ variant, className }: Props) {
  const reduce = usePrefersReducedMotion();
  const scene = scenes[variant];
  const byId = Object.fromEntries(scene.nodes.map((n) => [n.id, n]));

  return (
    <div
      className={cx(
        "relative isolate overflow-hidden rounded-[28px] border border-[var(--color-rule)]",
        "bg-[radial-gradient(circle_at_30%_20%,rgb(98_172_250/0.18),transparent_42%),radial-gradient(circle_at_78%_70%,rgb(82_36_212/0.28),transparent_46%),linear-gradient(160deg,#05071c_0%,#0b0a33_55%,#161152_100%)]",
        "shadow-[0_0_0_1px_rgb(98_172_250/0.08),0_30px_80px_rgb(9_13_51/0.55)]",
        className,
      )}
      aria-hidden={!scene.title}
    >
      {/* Brand light wash — logo blues + violet */}
      <div
        className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgb(98 172 250 / 0.35), transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-10 size-72 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgb(68 30 182 / 0.4), transparent 70%)" }}
      />

      <div className="relative flex items-center justify-between gap-3 border-b border-[var(--color-rule)] px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-[var(--color-sky)] shadow-[0_0_12px_var(--color-blue)]" />
          <span className="text-xs font-medium tracking-[0.16em] text-[#bdb4ff] uppercase">
            {scene.badge}
          </span>
        </div>
        <span className="text-xs text-[var(--color-faint)]">{scene.title}</span>
      </div>

      <div className="relative aspect-[4/3] w-full sm:aspect-[5/4] lg:aspect-square xl:aspect-[5/4]">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full p-3" role="img" aria-label={scene.title}>
          <defs>
            <linearGradient id={`edge-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#62acfa" stopOpacity="0.9" />
              <stop offset="55%" stopColor="#3387f2" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#5224d4" stopOpacity="0.85" />
            </linearGradient>
            <radialGradient id={`hub-${variant}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#62acfa" stopOpacity="1" />
              <stop offset="55%" stopColor="#1071fa" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#441eb6" stopOpacity="0.2" />
            </radialGradient>
            <filter id={`glow-${variant}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* soft orbit rings */}
          <circle
            cx="50"
            cy="50"
            r="34"
            fill="none"
            stroke="rgb(98 172 250 / 0.12)"
            strokeWidth="0.3"
            className={reduce ? undefined : "sp-orbit-spin"}
            style={{ transformOrigin: "50px 50px" }}
          />
          <circle
            cx="50"
            cy="50"
            r="26"
            fill="none"
            stroke="rgb(82 36 212 / 0.18)"
            strokeWidth="0.25"
            strokeDasharray="2 3"
            className={reduce ? undefined : "sp-orbit-spin-rev"}
            style={{ transformOrigin: "50px 50px" }}
          />

          {scene.edges.map(([a, b], i) => {
            const na = byId[a];
            const nb = byId[b];
            if (!na || !nb) return null;
            return (
              <line
                key={`${a}-${b}`}
                x1={na.x}
                y1={na.y}
                x2={nb.x}
                y2={nb.y}
                stroke={`url(#edge-${variant})`}
                strokeWidth="0.45"
                strokeOpacity="0.75"
                className={reduce ? undefined : "sp-edge-pulse"}
                style={{ animationDelay: `${i * 0.18}s` }}
              />
            );
          })}

          {scene.nodes.map((node, i) => (
            <g key={node.id} filter={`url(#glow-${variant})`}>
              {!reduce && node.hub ? (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="6.5"
                  fill="none"
                  stroke="#62acfa"
                  strokeOpacity="0.35"
                  className="sp-node-breath"
                  style={{ animationDelay: `${i * 0.12}s` }}
                />
              ) : null}
              <circle
                cx={node.x}
                cy={node.y}
                r={node.hub ? 3.2 : 2.1}
                fill={node.hub ? `url(#hub-${variant})` : "#9a96c9"}
                className={reduce ? undefined : "sp-node-breath"}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
              <text
                x={node.x}
                y={node.y - (node.hub ? 6.2 : 4.6)}
                textAnchor="middle"
                fill="#ffffff"
                style={{ fontSize: "3.1px", fontWeight: 500 }}
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="relative grid grid-cols-3 gap-2 border-t border-[var(--color-rule)] px-4 py-3">
        {["Verified", "Connected", "Governed"].map((label) => (
          <div
            key={label}
            className="rounded-lg bg-white/[0.04] px-2 py-2 text-center text-[10px] tracking-[0.12em] text-[var(--color-muted)] uppercase"
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
