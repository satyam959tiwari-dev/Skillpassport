"use client";

import {
  BadgeCheck,
  Check,
  ClipboardList,
  Layers,
  ShieldCheck,
  User,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useId, useState } from "react";
import { cx } from "@/lib/utils";
import {
  AudienceHeroShell,
  PhoneOnly,
  ScaledStage,
  Wire,
  WireDefs,
  useHeroReducedMotion,
} from "./HeroKit";
import s from "./TrustHero.module.css";

type CalloutId = "credentials" | "access" | "data" | "audit";

const callouts: {
  id: CalloutId;
  icon: LucideIcon;
  title: string;
  body: string;
  /** dotted connector, stage px (callout edge → shield / card) */
  wire: string;
  end: [number, number];
}[] = [
  {
    id: "credentials",
    icon: BadgeCheck,
    title: "Verified Credentials",
    body: "Documents, assessments, and reviews you can trust.",
    wire: "M262 140 C 282 140 290 176 300 198",
    end: [300, 198],
  },
  {
    id: "access",
    icon: Layers,
    title: "Access Control",
    body: "Role-based access with organization-level permissions.",
    wire: "M250 370 C 280 370 296 350 320 342",
    end: [320, 342],
  },
  {
    id: "data",
    icon: ShieldCheck,
    title: "Data Security",
    body: "Company-scoped data, email-verified sign-ups, and invited team seats.",
    wire: "M622 152 C 608 152 600 170 592 190",
    end: [592, 190],
  },
  {
    id: "audit",
    icon: ClipboardList,
    title: "Audit & Traceability",
    body: "A time-stamped record of key operator actions.",
    wire: "M622 372 C 600 372 588 356 570 346",
    end: [570, 346],
  },
];

const strip: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: ShieldCheck, title: "Multi-party Verification", body: "Candidates, verifiers, and experts" },
  { icon: Users, title: "Governed Access", body: "Organizations, roles, and approvals" },
  { icon: Layers, title: "End-to-End Integrity", body: "From submission to final decision" },
  { icon: Zap, title: "Transparent & Auditable", body: "Traceable, accountable, and reliable" },
];

export function TrustHero() {
  const [active, setActive] = useState<CalloutId | null>(null);
  const toggle = (id: CalloutId) => setActive((cur) => (cur === id ? null : id));

  return (
    <AudienceHeroShell
      ariaLabel="Trust and security"
      eyebrow="Trust & security"
      columns="minmax(0, 40fr) minmax(0, 60fr)"
      className={s.root}
      ground={<div className={s.sceneGlow} />}
      title={
        <>
          Built on verification, secured by{" "}
          <span className={s.aqua}>governance.</span>
        </>
      }
      titleClassName={s.title}
      description="A trusted, multi-party platform where skills, credentials, and reviews are verified, governed, and auditable across organizations."
      primaryCta={{ label: "Explore trust framework", href: "#framework" }}
      secondaryCta={{ label: "View security practices", href: "#demo" }}
      secondaryVariant="outline"
      secondaryIcon={<span hidden />}
      scene={<TrustScene active={active} onToggle={toggle} />}
      footer={
        <ul className={s.strip} aria-label="Trust principles">
          {strip.map(({ icon: Icon, title, body }) => (
            <li key={title}>
              <span className={s.stripIcon}>
                <Icon aria-hidden />
              </span>
              <span>
                <strong>{title}</strong>
                <span>{body}</span>
              </span>
            </li>
          ))}
        </ul>
      }
    />
  );
}

function TrustScene({ active, onToggle }: { active: CalloutId | null; onToggle: (id: CalloutId) => void }) {
  const reduce = useHeroReducedMotion();
  const uid = useId().replace(/:/g, "");
  const wid = `tw${uid}`;
  const g = (n: string) => `${wid}-${n}`;
  const shield =
    "M420 108 C452 126 486 132 518 134 C520 226 500 312 420 362 C340 312 320 226 322 134 C354 132 388 126 420 108 Z";
  const inner =
    "M420 124 C448 139 478 146 504 148 C505 228 487 300 420 344 C353 300 335 228 336 148 C362 146 392 139 420 124 Z";
  const front = "M180 228 A240 50 0 0 0 660 228";
  const back = "M180 228 A240 50 0 0 1 660 228";

  return (
    <div className={s.scene}>
      <ScaledStage
        width={880}
        height={585}
        label="Verified and governed: credential card protected by a trust shield"
        className={s.stageWrap}
        focus={{ x: 160, y: 0, w: 560, h: 560 }}
      >
        {/* Central composition (900 × 500 core space, scaled up from the pedestal centre) */}
        <div className={s.core} aria-hidden>
          {/* Glass ID card, tilted, behind the shield */}
          <div className={s.cardTilt}>
            <div className={s.card}>
              <span className={s.cardCheck}>
                <Check strokeWidth={3.2} />
              </span>
              <div className={s.cardHead}>
                <span className={s.avatar}>
                  <User />
                </span>
                <span className={s.cardLines}>
                  <i style={{ width: "78%" }} />
                  <i style={{ width: "54%" }} />
                </span>
              </div>
              <span className={s.cardRows}>
                <i style={{ width: "86%" }} />
                <i style={{ width: "64%" }} />
                <i style={{ width: "74%" }} />
                <i style={{ width: "48%" }} />
                <i style={{ width: "68%" }} />
                <i style={{ width: "58%" }} />
              </span>
            </div>
          </div>

          {/* Layered glowing platform */}
          <svg className={s.layer} viewBox="0 0 900 500">
            <defs>
              <radialGradient id={g("spill")} cx="50%" cy="50%" r="50%">
                <stop offset="0" stopColor="#3ab6ff" stopOpacity="0.55" />
                <stop offset="0.55" stopColor="#1f6bff" stopOpacity="0.22" />
                <stop offset="1" stopColor="#1f6bff" stopOpacity="0" />
              </radialGradient>
              <radialGradient id={g("top")} cx="50%" cy="45%" r="60%">
                <stop offset="0" stopColor="#3f9bff" stopOpacity="0.95" />
                <stop offset="0.45" stopColor="#1a4fb8" stopOpacity="0.95" />
                <stop offset="1" stopColor="#0b215e" stopOpacity="0.95" />
              </radialGradient>
              <linearGradient id={g("side")} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#3aa2ff" />
                <stop offset="0.5" stopColor="#1546b8" />
                <stop offset="1" stopColor="#0a1c58" />
              </linearGradient>
              <linearGradient id={g("side2")} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#1d64d8" />
                <stop offset="1" stopColor="#081648" />
              </linearGradient>
              <linearGradient id={g("rim")} x1="0" x2="1">
                <stop offset="0" stopColor="#62acfa" stopOpacity="0.35" />
                <stop offset="0.5" stopColor="#e2fdff" />
                <stop offset="1" stopColor="#62acfa" stopOpacity="0.35" />
              </linearGradient>
              <filter id={g("blur")} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" />
              </filter>
              <filter id={g("blur2")} x="-50%" y="-80%" width="200%" height="260%">
                <feGaussianBlur stdDeviation="14" />
              </filter>
            </defs>
            <ellipse cx="420" cy="456" rx="340" ry="70" fill={`url(#${g("spill")})`} />
            {/* lower step */}
            <path d="M166 432 L166 450 A254 46 0 0 0 674 450 L674 432 Z" fill={`url(#${g("side2")})`} />
            <ellipse cx="420" cy="432" rx="254" ry="46" fill="#0c2668" />
            <path d="M166 450 A254 46 0 0 0 674 450" fill="none" stroke="#5fd8ff" strokeWidth="6" strokeOpacity="0.7" filter={`url(#${g("blur")})`} />
            <path d="M166 450 A254 46 0 0 0 674 450" fill="none" stroke="#a6eeff" strokeWidth="1.6" />
            <ellipse cx="420" cy="432" rx="254" ry="46" fill="none" stroke="#6cc4ff" strokeOpacity="0.55" strokeWidth="1.4" />
            {/* upper disc */}
            <path d="M184 408 L184 428 A236 42 0 0 0 656 428 L656 408 Z" fill={`url(#${g("side")})`} />
            <path d="M184 428 A236 42 0 0 0 656 428" fill="none" stroke="#7fe6ff" strokeWidth="5" strokeOpacity="0.8" filter={`url(#${g("blur")})`} />
            <path d="M184 428 A236 42 0 0 0 656 428" fill="none" stroke="#d2f8ff" strokeWidth="1.4" />
            <ellipse cx="420" cy="408" rx="236" ry="42" fill={`url(#${g("top")})`} />
            <ellipse cx="420" cy="408" rx="236" ry="42" fill="none" stroke="#5fd8ff" strokeWidth="8" filter={`url(#${g("blur")})`} className={s.rimGlow} />
            <ellipse cx="420" cy="408" rx="236" ry="42" fill="none" stroke={`url(#${g("rim")})`} strokeWidth="3" />
            {/* rings on the top surface */}
            <ellipse cx="420" cy="406" rx="196" ry="34" fill="none" stroke="#5fd8ff" strokeWidth="6" strokeOpacity="0.85" filter={`url(#${g("blur")})`} />
            <ellipse cx="420" cy="406" rx="196" ry="34" fill="none" stroke="#d4f9ff" strokeWidth="1.8" />
            <ellipse cx="420" cy="405" rx="150" ry="26" fill="none" stroke="#86e4ff" strokeOpacity="0.7" strokeWidth="1.3" />
            <ellipse cx="420" cy="404" rx="126" ry="22" fill="#8fe8ff" opacity="0.4" filter={`url(#${g("blur2")})`} />
            <ellipse cx="420" cy="404" rx="104" ry="18" fill="none" stroke="#c6f5ff" strokeOpacity="0.95" strokeWidth="1.6" />
            <ellipse cx="420" cy="404" rx="104" ry="18" fill="none" stroke="#9fecff" strokeWidth="1.4" className={s.ripple} />
          </svg>

          {/* Orbit (back half) + shield + orbit (front half) */}
          <svg className={s.layer} viewBox="0 0 900 500">
            <defs>
              <linearGradient id={g("sh")} x1="0.1" y1="0" x2="0.9" y2="1">
                <stop offset="0" stopColor="#9ccdff" />
                <stop offset="0.28" stopColor="#5f8dff" />
                <stop offset="0.55" stopColor="#4c5cf2" />
                <stop offset="0.8" stopColor="#5d2fdc" />
                <stop offset="1" stopColor="#3a16a4" />
              </linearGradient>
              <linearGradient id={g("shade")} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ffffff" stopOpacity="0.2" />
                <stop offset="0.45" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="1" stopColor="#140a5a" stopOpacity="0.35" />
              </linearGradient>
              <linearGradient id={g("shRim")} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#f4fbff" />
                <stop offset="0.45" stopColor="#a6cbff" />
                <stop offset="1" stopColor="#a585ff" />
              </linearGradient>
              <linearGradient id={g("bevel")} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="0.5" stopColor="#c4dcff" stopOpacity="0.45" />
                <stop offset="1" stopColor="#8f7bff" stopOpacity="0.35" />
              </linearGradient>
              <linearGradient id={g("lock")} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ffffff" />
                <stop offset="1" stopColor="#a4ccff" />
              </linearGradient>
              <linearGradient id={g("gloss")} x1="0" y1="0" x2="1" y2="0.6">
                <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
              <linearGradient id={g("orb")} x1="0" x2="1">
                <stop offset="0" stopColor="#6cb8ff" stopOpacity="0.25" />
                <stop offset="0.5" stopColor="#e4fbff" />
                <stop offset="1" stopColor="#6cb8ff" stopOpacity="0.25" />
              </linearGradient>
              <filter id={g("bloom")} x="-80%" y="-60%" width="260%" height="220%">
                <feGaussianBlur stdDeviation="22" />
              </filter>
              <filter id={g("glow")} x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="7" />
              </filter>
              <filter id={g("soft")} x="-20%" y="-60%" width="140%" height="220%">
                <feGaussianBlur stdDeviation="3" />
              </filter>
            </defs>

            <g transform="rotate(-6 420 228)">
              <path d={back} fill="none" stroke="#6cb8ff" strokeOpacity="0.55" strokeWidth="9" filter={`url(#${g("soft")})`} />
              <path d={back} fill="none" stroke="#b4e6ff" strokeOpacity="0.85" strokeWidth="2.6" />
            </g>

            {/* Shield */}
            <g transform="translate(420 236) scale(1.16) translate(-420 -236)">
              <path d={shield} fill="#4a7cff" opacity="0.85" filter={`url(#${g("bloom")})`} className={s.shieldGlow} />
              <path d={shield} fill="none" stroke="#a8d4ff" strokeWidth="12" opacity="0.55" filter={`url(#${g("glow")})`} />
              <path d={shield} fill={`url(#${g("sh")})`} />
              <path d={shield} fill={`url(#${g("shade")})`} />
              <path d={shield} fill="none" stroke={`url(#${g("shRim")})`} strokeWidth="6.5" strokeLinejoin="round" />
              <path d={shield} fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="1.2" strokeLinejoin="round" />
              <path d={inner} fill="none" stroke="#2a1a8a" strokeOpacity="0.45" strokeWidth="4" transform="translate(1.5 2)" />
              <path d={inner} fill="none" stroke={`url(#${g("bevel")})`} strokeWidth="2.4" strokeLinejoin="round" />
              <path
                d="M420 124 C392 139 362 146 336 148 C335 214 348 272 386 318 C370 250 374 188 420 148 Z"
                fill={`url(#${g("gloss")})`}
              />
              {/* Padlock */}
              <rect x="380" y="220" width="80" height="66" rx="14" fill="#cfeaff" opacity="0.55" filter={`url(#${g("glow")})`} />
              <path d="M400 228 V210 a20 20 0 0 1 40 0 V228" fill="none" stroke="#a8ccff" strokeWidth="11" strokeLinecap="round" />
              <path d="M400 228 V210 a20 20 0 0 1 40 0 V228" fill="none" stroke="#f2f9ff" strokeWidth="7" strokeLinecap="round" />
              <rect x="386" y="224" width="68" height="56" rx="12" fill={`url(#${g("lock")})`} />
              <path d="M396 230 H444" stroke="#ffffff" strokeOpacity="0.9" strokeWidth="2" strokeLinecap="round" />
              <circle cx="420" cy="246" r="7" fill="#3c4fd8" />
              <rect x="416.5" y="248" width="7" height="16" rx="3.5" fill="#3c4fd8" />
            </g>

            <g transform="rotate(-6 420 228)">
              <path d={front} fill="none" stroke="#6cb8ff" strokeWidth="14" strokeOpacity="0.6" filter={`url(#${g("soft")})`} className={s.orbitGlow} />
              <path d={front} fill="none" stroke={`url(#${g("orb")})`} strokeWidth="3.6" />
              <path
                d={front}
                pathLength={100}
                fill="none"
                stroke="#ffffff"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="12 88"
                filter={`url(#${g("soft")})`}
                className={s.streak}
              />
              <path d={front} pathLength={100} fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeDasharray="12 88" className={s.streak} />
            </g>
          </svg>

          <div className={s.pill}>
            <span className={s.pillCheck}>
              <Check strokeWidth={3.4} />
            </span>
            Verified &amp; Governed
          </div>
        </div>

        {/* Connectors (stage space) */}
        <svg className={s.wires} viewBox="0 0 880 585" aria-hidden data-mhide>
          <WireDefs id={wid} />
          {callouts.map((c, i) => (
            <g key={c.id} className={cx(s.wire, active === c.id && s.wireOn)}>
              <Wire d={c.wire} id={wid} reduce={reduce} dash="2 5" dur={2.8} delay={i * 0.7} color="rgb(140 200 255 / 0.85)" width={1.7} />
              <circle cx={c.end[0]} cy={c.end[1]} r="8" fill="#6cb8ff" opacity="0.45" filter={`url(#${wid}-glow)`} />
              <circle cx={c.end[0]} cy={c.end[1]} r="3.8" fill="#e6fbff" />
            </g>
          ))}
        </svg>

        {callouts.map((c) => (
          <Callout key={c.id} c={c} on={active === c.id} onToggle={onToggle} className={s[c.id]} />
        ))}
      </ScaledStage>

      <PhoneOnly>
        <ul className={s.mList} aria-label="Trust controls">
          {callouts.map(({ id, icon: Icon, title, body }) => (
            <li key={id} className={s.mItem}>
              <span className={s.cIcon}>
                <Icon aria-hidden />
              </span>
              <span>
                <strong>{title}</strong>
                <span>{body}</span>
              </span>
            </li>
          ))}
        </ul>
      </PhoneOnly>
    </div>
  );
}

function Callout({
  c,
  on,
  onToggle,
  className,
}: {
  c: (typeof callouts)[number];
  on: boolean;
  onToggle: (id: CalloutId) => void;
  className?: string;
}) {
  const Icon = c.icon;
  return (
    <button
      type="button"
      data-mhide
      aria-pressed={on}
      aria-label={`Highlight ${c.title}: ${c.body}`}
      onClick={() => onToggle(c.id)}
      className={cx(s.callout, on && s.calloutOn, className)}
    >
      <span className={s.cIcon}>
        <Icon aria-hidden />
      </span>
      <span className={s.cText}>
        <strong>{c.title}</strong>
        <span>{c.body}</span>
      </span>
    </button>
  );
}
