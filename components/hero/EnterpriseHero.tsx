"use client";

import {
  ClipboardCheck,
  Crown,
  FileText,
  Layers,
  Lock,
  Network,
  ShieldCheck,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { cx } from "@/lib/utils";
import {
  AudienceHeroShell,
  PhoneOnly,
  ScaledStage,
  Wire,
  WireDefs,
  accentTitle,
  useHeroReducedMotion,
  type HeroCta,
} from "./HeroKit";
import s from "./EnterpriseHero.module.css";

type Props = {
  eyebrow: string;
  headline: string;
  accentWord: string;
  description: string;
  primaryCta: HeroCta;
  secondaryCta: HeroCta;
};

type Scope = "all" | "super" | "org";

const layers: { id: "platform" | "organization" | "teams"; label: string; icon: LucideIcon }[] = [
  { id: "platform", label: "Platform", icon: Layers },
  { id: "organization", label: "Organization", icon: Network },
  { id: "teams", label: "Teams", icon: Users },
];

/** Which roles each domain belongs to (mirrors the site's Super Admin vs Org Admin split). */
const domains: {
  id: string;
  label: [string, string?];
  orgLabel?: [string, string?];
  icon: LucideIcon;
  scopes: Scope[];
  pos: { left: number; top: number };
}[] = [
  { id: "roles", label: ["Roles &", "permissions"], orgLabel: ["Scoped", "roles"], icon: UsersRound, scopes: ["super", "org"], pos: { left: 654, top: 40 } },
  { id: "approvals", label: ["Approval", "gates"], icon: ShieldCheck, scopes: ["super"], pos: { left: 680, top: 140 } },
  { id: "audit", label: ["Audit trail"], icon: FileText, scopes: ["super"], pos: { left: 688, top: 244 } },
];

const captions: Record<Scope, string> = {
  all: "Select a role to see what it governs.",
  super:
    "Super Admin · platform-wide: organizations, permissions, verification oversight, approval gates and audit logs.",
  org: "Org Admin · one tenant: members, available modules and scoped roles. No platform-wide powers.",
};

export function EnterpriseHero(props: Props) {
  return (
    <AudienceHeroShell
      eyebrow={props.eyebrow}
      title={accentTitle(props.headline, props.accentWord)}
      titleClassName={s.title}
      description={props.description}
      primaryCta={props.primaryCta}
      secondaryCta={props.secondaryCta}
      scene={<GovernanceScene />}
    />
  );
}

function GovernanceScene() {
  const reduce = useHeroReducedMotion();
  const [scope, setScope] = useState<Scope>("all");
  const toggle = (next: Exclude<Scope, "all">) => setScope((cur) => (cur === next ? "all" : next));

  const layerOn = (id: string) =>
    scope === "all" || scope === "super" || (scope === "org" && id !== "platform");

  return (
    <>
    <ScaledStage
      width={860}
      height={600}
      label="Governance model"
      className={s.stageWrap}
      focus={{ x: 214, y: 6, w: 392, h: 494 }}
    >
      <svg className={s.back} viewBox="0 0 860 600" aria-hidden>
        <WireDefs id="ent" />
        <defs>
          <radialGradient id="ent-disc" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#1a7cff" stopOpacity="0.28" />
            <stop offset="0.75" stopColor="#0b3d9a" stopOpacity="0.18" />
            <stop offset="1" stopColor="#62acfa" stopOpacity="0.35" />
          </radialGradient>
        </defs>
        {[
          { cy: 229, rx: 168, ry: 36 },
          { cy: 295, rx: 186, ry: 40 },
          { cy: 361, rx: 176, ry: 38 },
        ].map((d, i) => (
          <g key={i}>
            <ellipse cx="410" cy={d.cy} rx={d.rx} ry={d.ry} fill="url(#ent-disc)" stroke="rgb(98 172 250 / 0.55)" strokeWidth="1.4" />
            <ellipse
              className={s.spin}
              cx="410"
              cy={d.cy}
              rx={d.rx - 10}
              ry={d.ry - 4}
              fill="none"
              stroke="rgb(190 220 255 / 0.55)"
              strokeWidth="1"
              strokeDasharray="3 14"
              style={{ animationDuration: `${14 + i * 4}s`, animationDirection: i % 2 ? "reverse" : "normal" }}
            />
          </g>
        ))}

        <g data-mhide>
        {/* Role wires (left) */}
        <Wire id="ent" d="M196 86 C 250 96, 262 180, 312 222" reduce={reduce} dur={3.4} delay={0.2} dash="2 5" color="rgb(108 184 255 / 0.55)" />
        <Wire id="ent" d="M186 222 C 230 230, 256 276, 312 288" reduce={reduce} dur={3.4} delay={1.6} dash="2 5" color="rgb(108 184 255 / 0.55)" />
        {/* Domain wires (right) */}
        <Wire id="ent" d="M654 84 C 600 92, 580 160, 510 200" reduce={reduce} dur={3.6} delay={0.9} dash="2 5" color="rgb(108 184 255 / 0.55)" />
        <Wire id="ent" d="M680 180 C 630 186, 610 240, 520 262" reduce={reduce} dur={3.6} delay={2.1} dash="2 5" color="rgb(108 184 255 / 0.55)" />
        <Wire id="ent" d="M688 280 C 640 284, 620 320, 520 330" reduce={reduce} dur={3.6} delay={2.9} dash="2 5" color="rgb(108 184 255 / 0.55)" />
        </g>
      </svg>

      {/* Pedestal */}
      <div className={s.pedestal} aria-hidden>
        <span className={s.pedBase} />
        <span className={s.ripple} />
        <span className={s.ripple} />
        <span className={s.pedRing} />
        <span className={s.pedCore} />
      </div>

      {/* Tower */}
      <div className={s.tower}>
        <div className={cx(s.hex, scope !== "all" && s.hexActive)} aria-hidden>
          <div className={s.hexInner}>
            <ShieldCheck className={s.hexIcon} />
            <span>
              Governance
              <br />
              Constellation
            </span>
          </div>
        </div>
        <ul className={s.slabs} aria-label="Governance layers">
          {layers.map((l) => {
            const Icon = l.icon;
            const on = layerOn(l.id);
            return (
              <li
                key={l.id}
                className={cx(
                  s.slab,
                  !on && s.slabOff,
                  scope === "super" && l.id === "platform" && s.slabHot,
                  scope === "org" && l.id !== "platform" && s.slabHot,
                )}
              >
                <Icon aria-hidden />
                {scope === "org" && l.id === "platform" ? (
                  /* One label block: name + scope note stacked, never overlapping */
                  <span className={s.slabStack}>
                    {l.label}
                    <em className={s.notInherited}>Outside tenant scope</em>
                  </span>
                ) : (
                  l.label
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Role callouts (left) — buttons that switch the highlighted scope */}
      <button
        type="button"
        data-mhide
        className={cx(s.role, scope === "super" && s.roleOn)}
        style={{ left: 16, top: 50 }}
        aria-pressed={scope === "super"}
        onClick={() => toggle("super")}
      >
        <Crown aria-hidden />
        <span>
          <strong>Super Admin ·</strong>
          <small>Platform scope</small>
        </span>
      </button>
      <button
        type="button"
        data-mhide
        className={cx(s.role, scope === "org" && s.roleOn)}
        style={{ left: 2, top: 186 }}
        aria-pressed={scope === "org"}
        onClick={() => toggle("org")}
      >
        <UsersRound aria-hidden />
        <span>
          <strong>Org Admin ·</strong>
          <small>Tenant scope</small>
        </span>
      </button>

      {/* Domain callouts (right) */}
      {domains.map((d) => {
        const Icon = d.icon;
        const on = scope === "all" || d.scopes.includes(scope);
        const label = scope === "org" && d.orgLabel ? d.orgLabel : d.label;
        return (
          <div
            key={d.id}
            data-mhide
            className={cx(s.domain, !on && s.domainOff, scope !== "all" && on && s.domainOn)}
            style={{ left: d.pos.left, top: d.pos.top }}
          >
            <Icon aria-hidden />
            <span>
              {label[0]}
              {label[1] ? (
                <>
                  <br />
                  {label[1]}
                </>
              ) : null}
            </span>
            {!on ? <span className="sr-only"> (Super Admin only)</span> : null}
          </div>
        );
      })}

      {/* Scoped access bar */}
      <div className={s.bar} data-mhide>
        <div className={s.barLead}>
          <Lock aria-hidden />
          Scoped access
        </div>
        <button
          type="button"
          className={cx(s.barItem, scope === "super" && s.barItemOn)}
          aria-pressed={scope === "super"}
          onClick={() => toggle("super")}
        >
          <Layers aria-hidden />
          <span>
            Platform-wide authority
            <small>(Super Admin)</small>
          </span>
        </button>
        <button
          type="button"
          className={cx(s.barItem, scope === "org" && s.barItemOn)}
          aria-pressed={scope === "org"}
          onClick={() => toggle("org")}
        >
          <Network aria-hidden />
          <span>
            Tenant-scoped authority
            <small>(Org Admin)</small>
          </span>
        </button>
      </div>

      <p className={s.caption} aria-live="polite" data-mhide>
        <ClipboardCheck aria-hidden />
        {captions[scope]}
      </p>
    </ScaledStage>
    <PhoneOnly>
      <div className={s.phoneRoles} role="group" aria-label="Highlight a role's scope">
        <button type="button" aria-pressed={scope === "super"} className={cx(s.phoneRole, scope === "super" && s.phoneRoleOn)} onClick={() => toggle("super")}>
          <Crown aria-hidden />
          <span>
            <b>Super Admin</b>
            <small>Platform-wide</small>
          </span>
        </button>
        <button type="button" aria-pressed={scope === "org"} className={cx(s.phoneRole, scope === "org" && s.phoneRoleOn)} onClick={() => toggle("org")}>
          <UsersRound aria-hidden />
          <span>
            <b>Org Admin</b>
            <small>Tenant-scoped</small>
          </span>
        </button>
      </div>
      <ul className={s.phoneDomains}>
        {domains.map((d) => {
          const Icon = d.icon;
          const on = scope === "all" || d.scopes.includes(scope);
          const label = scope === "org" && d.orgLabel ? d.orgLabel : d.label;
          return (
            <li key={d.id} className={cx(!on && s.phoneDomainOff, scope !== "all" && on && s.phoneDomainOn)}>
              <Icon aria-hidden />
              {label.filter(Boolean).join(" ")}
              {!on ? <span className="sr-only"> (Super Admin only)</span> : null}
            </li>
          );
        })}
      </ul>
      <p className={s.phoneCaption} aria-live="polite">
        <ClipboardCheck aria-hidden />
        {captions[scope]}
      </p>
    </PhoneOnly>
    </>
  );
}
