"use client";

import { useState } from "react";
import {
  Award,
  Briefcase,
  ChevronRight,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Layers,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { TravelPulse } from "@/components/ui/TravelPulse";
import { Reveal } from "@/components/ui/Reveal";
import { cx } from "@/lib/utils";

type RoleId =
  | "candidates"
  | "employers"
  | "verifiers"
  | "reviewers"
  | "org"
  | "super";

const roles: Array<{
  id: RoleId;
  label: string;
  short: string;
  href: string;
  blurb: string;
  icon: typeof Users;
  color: string;
  /** Degrees from +x; fixed so SSR/client match */
  angle: number;
}> = [
  {
    id: "candidates",
    label: "Candidates",
    short: "Candidates",
    href: "/candidates/",
    blurb: "Build a verified skill profile, documents, assessments, and jobs.",
    icon: Users,
    color: "#62acfa",
    angle: -90,
  },
  {
    id: "employers",
    label: "Employers",
    short: "Employers",
    href: "/employers/",
    blurb: "Post jobs, search talent, and hire with verified proof.",
    icon: Briefcase,
    color: "#818cf8",
    angle: -30,
  },
  {
    id: "verifiers",
    label: "Verifier Companies",
    short: "Verifiers",
    href: "/verifiers/",
    blurb: "Run document verification cases and SLA-driven checks.",
    icon: ShieldCheck,
    color: "#34d399",
    angle: 30,
  },
  {
    id: "reviewers",
    label: "Reviewers / Trainers",
    short: "Reviewers",
    href: "/reviewers/",
    blurb: "Design rubrics and checklists, then grade skill evidence.",
    icon: GraduationCap,
    color: "#c084fc",
    angle: 90,
  },
  {
    id: "super",
    label: "Super Admins",
    short: "Super Admin",
    href: "/enterprises/",
    blurb: "Govern credentials, users, orgs, assessments, and audit.",
    icon: Settings,
    color: "#e879f9",
    angle: 150,
  },
  {
    id: "org",
    label: "Organization Admins",
    short: "Org Admins",
    href: "/enterprises/",
    blurb: "Scoped admin for credentials, modules, members, and tenants.",
    icon: Layers,
    color: "#60a5fa",
    angle: 210,
  },
];

/**
 * Outer ring attachments:
 * Skills → Candidates · Opportunities → Employers · Documents → Verifiers ·
 * Assessments → Reviewers · Credentials → Super Admin & Org Admin (one node, two links)
 */
const outerNodes: Array<{
  label: string;
  icon: typeof Award;
  angle: number;
  color: string;
  from: RoleId | RoleId[];
  /** Optional outer radius override (viewBox %) */
  r?: number;
}> = [
  /* Outer pills — Employers/Verifiers use the same down-side offset (+32°) + radius */
  { label: "Skills", icon: GraduationCap, angle: -140, color: "#2dd4bf", from: "candidates" },
  { label: "Opportunities", icon: Briefcase, angle: 2, color: "#f472b6", from: "employers", r: 45 },
  { label: "Documents", icon: FileText, angle: 62, color: "#34d399", from: "verifiers", r: 45 },
  { label: "Assessments", icon: ClipboardCheck, angle: 118, color: "#62acfa", from: "reviewers" },
  { label: "Credentials", icon: Award, angle: 185, color: "#c084fc", from: ["super", "org"] },
];

/** Hub rim / role orbit radii in viewBox % — keep spokes visible on vertical axis */
const HUB_R = 12.8;
const ROLE_R = 31;
/** Tip just inside role node rim so Candidates/Reviewers spokes meet the icons */
const SPOKE_TIP_R = 27.6;
const OUTER_R = 42;
/** Outer curves start just outside the role pill so lines aren’t buried under icons */
const OUTER_LINK_START_R = ROLE_R + 5.4;

const connectBar = [
  { label: "Skills", hint: "Verified capabilities on the candidate passport.", icon: GraduationCap },
  { label: "Documents", hint: "Verification cases operated by verifier companies.", icon: FileText },
  { label: "Assessments", hint: "Rubrics and checklists scored by expert reviewers.", icon: ClipboardCheck },
  { label: "Opportunities", hint: "Jobs and hiring pathways for employers.", icon: Briefcase },
  { label: "Credentials", hint: "Governed by Super Admin and Organization Admin.", icon: Award },
] as const;

/** Card grid order matching SkillPassport Trust Ecosystem Dashboard (2×3). */
const cardOrder: RoleId[] = [
  "candidates",
  "employers",
  "verifiers",
  "reviewers",
  "org",
  "super",
];

function polar(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: (50 + Math.cos(rad) * radius).toFixed(4),
    y: (50 + Math.sin(rad) * radius).toFixed(4),
  };
}

/** Default outer arc — same style as before (outward polar bulge). */
function curvePath(a0: number, r0: number, a1: number, r1: number) {
  const p0 = polar(a0, r0);
  const p1 = polar(a1, r1);
  const span = ((((a1 - a0) % 360) + 540) % 360) - 180;
  const midA = a0 + span / 2;
  const bulge = Math.abs(span) < 28 ? 5.5 : 2.4;
  const mid = polar(midA, (r0 + r1) / 2 + bulge);
  return `M ${p0.x} ${p0.y} Q ${mid.x} ${mid.y} ${p1.x} ${p1.y}`;
}

/**
 * Down-side arc used only for Employers→Opportunities and Verifiers→Documents.
 * Same recipe for both: mid-angle biased toward the higher angle (down side)
 * with a strong outward bulge so the two links match.
 */
function curvePathDown(a0: number, r0: number, a1: number, r1: number) {
  const p0 = polar(a0, r0);
  const p1 = polar(a1, r1);
  const lo = Math.min(a0, a1);
  const hi = Math.max(a0, a1);
  const midA = lo + (hi - lo) * 0.62;
  const mid = polar(midA, (r0 + r1) / 2 + 6.8);
  return `M ${p0.x} ${p0.y} Q ${mid.x} ${mid.y} ${p1.x} ${p1.y}`;
}

/**
 * Trust ecosystem — matches SkillPassport Trust Ecosystem Dashboard:
 * left 2-col role cards, right 2-level orbit (roles on ring + outer connects), bottom bar.
 * No separate detail panel.
 */
export function TrustEcosystem() {
  const [active, setActive] = useState<RoleId>("candidates");
  const roleById = Object.fromEntries(roles.map((r) => [r.id, r])) as Record<
    RoleId,
    (typeof roles)[number]
  >;

  return (
    <section className="sp-section relative overflow-visible bg-[#090d33]">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(45% 40% at 78% 18%, rgb(98 172 250 / 0.16), transparent 55%), radial-gradient(35% 30% at 12% 88%, rgb(106 70 232 / 0.16), transparent 60%)",
        }}
      />

      <div className="sp-container relative">
        <div className="grid items-start gap-6 lg:grid-cols-[0.95fr_1.15fr] lg:gap-8">
          <div>
            <Reveal>
              <p className="sp-eyebrow">Trust ecosystem</p>
              <h2 className="sp-heading mt-3 text-[clamp(30px,3.6vw,48px)]">
                One ecosystem.{" "}
                <span className="sp-gradient-text">Shared trust.</span>
              </h2>
              <p className="sp-lede mt-3 max-w-xl text-[16px]">
                A connected, multi-party ecosystem where people, organizations, and verifiers
                build, validate, and use trusted skills and career evidence.
              </p>
            </Reveal>

            <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {cardOrder.map((id) => {
                const role = roleById[id];
                const Icon = role.icon;
                const on = active === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActive(id)}
                    className={cx(
                      "group flex items-center gap-2.5 rounded-xl border px-3.5 py-3.5 text-left transition",
                      on
                        ? "border-[rgb(98_172_250/0.55)] bg-[linear-gradient(135deg,rgb(98_172_250/0.16),rgb(82_36_212/0.1))] shadow-[0_0_22px_rgb(98_172_250/0.22)]"
                        : "border-[var(--color-rule)] bg-white/[0.03] hover:border-[rgb(98_172_250/0.35)]",
                    )}
                  >
                    <span
                      className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: `${role.color}22`, color: role.color }}
                    >
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-1">
                        <span className="text-[15px] font-medium text-white">{role.label}</span>
                        <ChevronRight
                          className={cx(
                            "size-3.5 shrink-0",
                            on ? "text-[var(--color-sky)]" : "text-white/25",
                          )}
                          aria-hidden
                        />
                      </span>
                      <span className="mt-0.5 block text-[13px] leading-snug text-[var(--color-faint)]">
                        {role.blurb}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: two-level orbital diagram (inner roles ON ring + outer connects) */}
          <Reveal className="relative mx-auto w-full max-w-[560px] overflow-visible">
            {/* Extra pad so Candidates (top) + Reviewers (bottom) labels aren't clipped */}
            <div className="relative aspect-square w-full overflow-visible px-[5%] py-[8%]">
              <svg className="pointer-events-none absolute inset-0 z-[15] size-full overflow-visible" viewBox="0 0 100 100" aria-hidden>
                <defs>
                  {/* userSpaceOnUse — objectBoundingBox breaks on vertical Candidates/Reviewers spokes */}
                  <linearGradient
                    id="te2-line"
                    gradientUnits="userSpaceOnUse"
                    x1="50"
                    y1="38"
                    x2="50"
                    y2="22"
                  >
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                    <stop offset="55%" stopColor="#62acfa" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.75" />
                  </linearGradient>
                  <linearGradient
                    id="te2-line-any"
                    gradientUnits="userSpaceOnUse"
                    x1="38"
                    y1="50"
                    x2="62"
                    y2="50"
                  >
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                    <stop offset="100%" stopColor="#62acfa" stopOpacity="0.75" />
                  </linearGradient>
                  <radialGradient id="te2-hub-glow" cx="50%" cy="45%" r="50%">
                    <stop offset="0%" stopColor="#a8d4ff" stopOpacity="0.35" />
                    <stop offset="55%" stopColor="#5234d4" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#090d33" stopOpacity="0" />
                  </radialGradient>
                  <filter id="te2-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="0.45" result="b" />
                    <feMerge>
                      <feMergeNode in="b" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  {/* Cut only INSIDE hub rim — spokes touch outer edge, never enter */}
                  <mask id="te2-spokes-mask">
                    <rect x="0" y="0" width="100" height="100" fill="white" />
                    <circle cx="50" cy="50" r={HUB_R - 0.15} fill="black" />
                  </mask>
                </defs>

                <circle cx="50" cy="50" r="44" fill="url(#te2-hub-glow)" />

                {/* Nested orbit rings — role nodes sit ON the inner ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={ROLE_R}
                  fill="none"
                  stroke="rgb(98 172 250 / 0.32)"
                  strokeWidth="0.45"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={ROLE_R}
                  fill="none"
                  stroke="rgb(98 172 250 / 0.14)"
                  strokeWidth="0.25"
                  strokeDasharray="1.2 1.5"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="37.5"
                  fill="none"
                  stroke="rgb(106 70 232 / 0.16)"
                  strokeWidth="0.28"
                  strokeDasharray="0.8 1.6"
                />

                {/* No SVG filter here — objectBoundingBox filters erase vertical Candidates/Reviewers spokes */}
                <g mask="url(#te2-spokes-mask)">
                  {roles.map((role) => {
                    /* Flush on hub rim — single thin stroke (thick underlays look like dots when mask-clipped) */
                    const start = polar(role.angle, HUB_R + 0.02);
                    const tip = polar(role.angle, SPOKE_TIP_R);
                    return (
                      <line
                        key={role.id}
                        x1={start.x}
                        y1={start.y}
                        x2={tip.x}
                        y2={tip.y}
                        stroke="#62acfa"
                        strokeWidth="0.55"
                        strokeOpacity="0.58"
                        strokeLinecap="butt"
                      />
                    );
                  })}

                  {outerNodes.flatMap((node) => {
                    const fromIds = Array.isArray(node.from) ? node.from : [node.from];
                    const tipR = (node.r ?? OUTER_R) - 1.8;
                    return fromIds.map((fromId) => {
                      const nearRole = roleById[fromId];
                      /* Down-side curve only for Employers→Opportunities & Verifiers→Documents */
                      const link =
                        fromId === "employers" || fromId === "verifiers"
                          ? curvePathDown
                          : curvePath;
                      const d = link(nearRole.angle, OUTER_LINK_START_R, node.angle, tipR);
                      return (
                        <g key={`${node.label}-${fromId}`}>
                          <path
                            d={d}
                            fill="none"
                            stroke="#8ec5ff"
                            strokeWidth="0.55"
                            strokeOpacity="0.72"
                            strokeLinecap="round"
                          />
                        </g>
                      );
                    });
                  })}
                </g>
                {/* Traveling pulses — keep outside filters; mask still clips hub interior */}
                <g mask="url(#te2-spokes-mask)" style={{ pointerEvents: "none" }}>
                  {roles.map((role, i) => {
                    const start = polar(role.angle, HUB_R + 0.02);
                    const tip = polar(role.angle, SPOKE_TIP_R);
                    return (
                      <TravelPulse
                        key={`pulse-${role.id}`}
                        path={`M ${start.x} ${start.y} L ${tip.x} ${tip.y}`}
                        duration={2.4 + (i % 3) * 0.4}
                        delay={i * 0.38}
                        r={0.72}
                        glowR={1.55}
                      />
                    );
                  })}
                  {outerNodes.flatMap((node, i) => {
                    const fromIds = Array.isArray(node.from) ? node.from : [node.from];
                    const tipR = (node.r ?? OUTER_R) - 1.8;
                    return fromIds.map((fromId, j) => {
                      const nearRole = roleById[fromId];
                      const link =
                        fromId === "employers" || fromId === "verifiers"
                          ? curvePathDown
                          : curvePath;
                      return (
                        <TravelPulse
                          key={`pulse-out-${node.label}-${fromId}`}
                          path={link(
                            nearRole.angle,
                            OUTER_LINK_START_R,
                            node.angle,
                            tipR,
                          )}
                          duration={3.1 + ((i + j) % 2) * 0.5}
                          delay={0.6 + (i + j) * 0.45}
                          r={0.62}
                          glowR={1.35}
                          fill="#7eb8f5"
                        />
                      );
                    });
                  })}
                </g>
              </svg>

              {/* Center SkillPassport hub — absolute % of diagram box so rim = HUB_R */}
              <div
                className="absolute top-1/2 left-1/2 z-10 flex aspect-square -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full"
                style={{
                  width: `${HUB_R * 2}%`,
                  background:
                    "radial-gradient(circle at 30% 25%, rgb(168 212 255 / 0.8), rgb(82 36 212 / 0.9) 48%, rgb(9 13 51 / 1) 100%)",
                  boxShadow:
                    "0 0 44px rgb(98 172 250 / 0.55), inset 0 0 26px rgb(255 255 255 / 0.18)",
                  border: "1.5px solid rgb(168 212 255 / 0.6)",
                }}
              >
                <ShieldCheck className="size-[26%] text-white" aria-hidden />
                <p className="mt-0.5 max-w-[90%] truncate px-1 text-center text-[clamp(8px,1.6vw,11px)] leading-tight font-semibold text-white">
                  SkillPassport®
                </p>
              </div>

              {/* Inner level: glassy role nodes ON the bigger circle */}
              {roles.map((role) => {
                const pos = polar(role.angle, ROLE_R);
                const Icon = role.icon;
                const on = active === role.id;
                const labelAbove = role.id === "candidates";
                return (
                  <button
                    key={role.id}
                    type="button"
                    aria-label={role.label}
                    title={role.label}
                    onClick={() => setActive(role.id)}
                    className={cx(
                      "absolute z-20 flex -translate-x-1/2 -translate-y-1/2 items-center gap-0.5",
                      labelAbove ? "flex-col-reverse" : "flex-col",
                    )}
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  >
                    <span
                      className={cx(
                        "flex size-9 items-center justify-center rounded-full border backdrop-blur-md transition sm:size-10",
                        on ? "scale-110 border-white/60" : "border-white/25",
                      )}
                      style={{
                        background: `radial-gradient(circle at 32% 28%, ${role.color}77, rgb(9 13 51 / 0.78) 72%)`,
                        boxShadow: on
                          ? `0 0 24px ${role.color}aa, inset 0 0 12px rgb(255 255 255 / 0.18)`
                          : `0 0 14px ${role.color}55, inset 0 0 10px rgb(255 255 255 / 0.12)`,
                      }}
                    >
                      <Icon className="size-3.5 text-white sm:size-4" aria-hidden />
                    </span>
                    <span
                      className={cx(
                        "max-w-[5.75rem] text-center text-[11px] font-semibold leading-tight text-white sm:text-xs",
                        role.id === "candidates" || role.id === "reviewers"
                          ? "drop-shadow-[0_1px_8px_rgb(0_0_0/1)]"
                          : "drop-shadow-[0_1px_4px_rgb(0_0_0/0.75)]",
                      )}
                    >
                      {role.short}
                    </span>
                  </button>
                );
              })}

              {/* Outer level: Skills / Opportunities / Documents / Assessments / Credentials */}
              {outerNodes.map((node) => {
                const pos = polar(node.angle, node.r ?? OUTER_R);
                const Icon = node.icon;
                return (
                  <div
                    key={node.label}
                    className={cx(
                      "absolute z-20 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border border-[rgb(98_172_250/0.4)] bg-[rgb(8_14_42/0.95)] py-1.5 pr-2.5 pl-1.5 shadow-[0_0_20px_rgb(98_172_250/0.22)] backdrop-blur-md",
                      /* Phones: pull edge pills inward so they never spill past the viewport */
                      parseFloat(pos.x) > 80 && "max-sm:-translate-x-[80%]",
                      parseFloat(pos.x) < 20 && "max-sm:-translate-x-[18%]",
                    )}
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  >
                    <span
                      className="inline-flex size-6 items-center justify-center rounded-md"
                      style={{
                        background: `${node.color}28`,
                        color: node.color,
                        boxShadow: `0 0 12px ${node.color}44`,
                      }}
                    >
                      <Icon className="size-3" aria-hidden />
                    </span>
                    <span className="whitespace-nowrap text-[11px] font-medium text-white sm:text-xs">
                      {node.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>

        {/* Bottom bar only — no extra Candidates detail panel */}
        <Reveal className="mt-8 rounded-[18px] border border-[rgb(98_172_250/0.22)] bg-[linear-gradient(165deg,rgb(18_22_70/0.78),rgb(9_13_51/0.72))] px-4 py-5 shadow-[0_0_0_1px_rgb(98_172_250/0.06),inset_0_1px_0_rgb(255_255_255/0.05)] backdrop-blur-xl sm:px-6 sm:py-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-7">
            <div className="flex shrink-0 items-center gap-2.5 lg:min-w-[13rem]">
              <Layers className="size-5 text-[var(--color-sky)]" aria-hidden />
              <p className="text-[13px] tracking-[0.14em] text-[var(--color-faint)] uppercase sm:text-sm">
                What SkillPassport connects
              </p>
            </div>
            <ul className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {connectBar.map(({ label, hint, icon: Icon }) => (
                <li key={label} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-[rgb(98_172_250/0.28)] bg-[rgb(98_172_250/0.12)] text-[var(--color-sky)]">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-[15px] font-medium text-white sm:text-base">
                      {label}
                    </span>
                    <span className="mt-1 block text-[13px] leading-snug text-[var(--color-faint)] sm:text-sm">
                      {hint}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
