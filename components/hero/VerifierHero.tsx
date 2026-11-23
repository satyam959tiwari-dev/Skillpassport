"use client";

import { motion } from "motion/react";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ClipboardCheck,
  FileCheck2,
  Flag,
  Gauge,
  GraduationCap,
  Landmark,
  Layers,
  QrCode,
  ScanSearch,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useState, type CSSProperties } from "react";
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
import s from "./VerifierHero.module.css";

type Props = {
  eyebrow: string;
  headline: string;
  accentWord: string;
  description: string;
  primaryCta: HeroCta;
  secondaryCta: HeroCta;
};

const stages: { label: string; icon: LucideIcon }[] = [
  { label: "Request received", icon: FileCheck2 },
  { label: "Evidence check", icon: ScanSearch },
  { label: "Verifier review", icon: UserRound },
  { label: "Admin gate", icon: ShieldCheck },
  { label: "Outcome", icon: Flag },
];

/** Illustrative audit trail for one sample case. */
const audit = [
  { label: "Request received", time: "Today, 10:24 AM", current: "Logging request" },
  { label: "Evidence checked", time: "Today, 10:37 AM", current: "Checking evidence" },
  { label: "Verifier review", time: "Today, 11:05 AM", current: "In progress" },
  { label: "Admin approval", time: "Today, 11:20 AM", current: "Awaiting admin gate" },
];

const callouts: { title: string; body: string; icon: LucideIcon; top: number; wire: string }[] = [
  {
    title: "Issuer validation",
    body: "Check institution credibility and validity.",
    icon: Landmark,
    top: 92,
    wire: "M206 134 C 240 134, 246 168, 290 176",
  },
  {
    title: "Document integrity",
    body: "Inspect authenticity, modifications, and consistency.",
    icon: Layers,
    top: 214,
    wire: "M216 262 C 248 262, 262 276, 290 280",
  },
  {
    title: "Evidence review",
    body: "Match with provided records and context.",
    icon: ClipboardCheck,
    top: 344,
    wire: "M206 384 C 244 384, 258 362, 292 356",
  },
];

export function VerifierHero(props: Props) {
  const [stage, setStage] = useState(2);
  return (
    <AudienceHeroShell
      eyebrow={props.eyebrow}
      title={accentTitle(props.headline, props.accentWord)}
      description={props.description}
      primaryCta={props.primaryCta}
      secondaryCta={props.secondaryCta}
      scene={<VerificationScene stage={stage} />}
      footer={<FlowBar stage={stage} onSelect={setStage} />}
    />
  );
}

function FlowBar({ stage, onSelect }: { stage: number; onSelect: (i: number) => void }) {
  return (
    <div className={s.flowWrap}>
      <ol className={s.flow} aria-label="Verification case flow — choose a stage">
        {stages.map((st, i) => {
          const Icon = st.icon;
          const active = i === stage;
          return (
            <li key={st.label} className={s.flowItem}>
              {i > 0 ? <ArrowRight className={s.flowArrow} aria-hidden /> : null}
              <button
                type="button"
                className={cx(s.flowBtn, active && s.flowBtnActive, i < stage && s.flowBtnDone)}
                aria-pressed={active}
                aria-current={active ? "step" : undefined}
                onClick={() => onSelect(i)}
              >
                <span className={s.flowIcon}>
                  <Icon aria-hidden />
                  {i < stage ? (
                    <span className={s.flowTick} aria-hidden>
                      <Check />
                    </span>
                  ) : null}
                </span>
                <span>{st.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function VerificationScene({ stage }: { stage: number }) {
  const reduce = useHeroReducedMotion();
  const progress = Math.round(((stage + 1) / stages.length) * 100);

  return (
    <>
    <ScaledStage
      width={860}
      height={560}
      label="Verification case"
      className={s.stageWrap}
      focus={{ x: 214, y: 0, w: 412, h: 500 }}
    >
      {/* Wires (behind cards) */}
      <svg className={s.wires} viewBox="0 0 860 560" aria-hidden data-mhide>
        <WireDefs id="ver" />
        {callouts.map((c, i) => (
          <Wire key={c.title} id="ver" d={c.wire} reduce={reduce} dur={3.2} delay={i * 1.1} />
        ))}
        <Wire id="ver" d="M604 92 C 566 96, 540 62, 508 48" reduce={reduce} dur={3.6} delay={0.6} />
        <Wire id="ver" d="M612 262 C 572 262, 544 252, 506 246" reduce={reduce} dur={3.4} delay={1.8} />
      </svg>

      {/* Scanner halo + light beam */}
      <div className={s.halo} aria-hidden>
        <span className={s.haloRing} />
        <span className={s.haloCore} />
      </div>
      <div className={s.beam} aria-hidden />

      {/* Pedestal */}
      <div className={s.pedestal} aria-hidden>
        <span className={s.pedBase} />
        <span className={s.ripple} />
        <span className={s.ripple} />
        <span className={s.pedRing} />
        <span className={s.pedCore} />
      </div>

      {/* Certificate stack */}
      <div className={s.certWrap}>
        <div className={s.certFloat}>
          <div className={cx(s.sheet, s.sheet2)} aria-hidden />
          <div className={cx(s.sheet, s.sheet1)} aria-hidden />
          <div className={s.cert} role="img" aria-label="Degree certificate under verification">
            <span className={s.corner} data-pos="tl" aria-hidden />
            <span className={s.corner} data-pos="tr" aria-hidden />
            <span className={s.corner} data-pos="bl" aria-hidden />
            <span className={s.corner} data-pos="br" aria-hidden />
            <div className={s.crest} aria-hidden>
              <Laurel />
              <GraduationCap />
              <Laurel flip />
            </div>
            <p className={s.certTitle}>Degree Certificate</p>
            <div className={s.certLines} aria-hidden>
              <i style={{ width: "72%" }} />
              <i style={{ width: "88%" }} />
              <i style={{ width: "64%" }} />
              <i style={{ width: "80%" }} />
            </div>
            <div className={s.certFoot} aria-hidden>
              <span className={s.seal}>
                <BadgeCheck />
              </span>
              <QrCode className={s.qr} />
            </div>
            <span className={s.scan} aria-hidden />
          </div>
        </div>
      </div>

      {/* Magnifier */}
      <div className={s.lens} aria-hidden>
        <span className={s.lensGlass}>
          <svg viewBox="0 0.5 24 25" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false">
            <path d="M12.6 19.5H5a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v8" />
            <path d="M6 7h7M6 10h7M6 13h4.5" />
            <circle cx="17" cy="16.4" r="3.5" />
            <circle cx="17" cy="16.4" r="1.5" />
            <path d="M15.4 19.5l-.9 3.5 1.5-.6.9 1.2.5-3.1M18.6 19.5l.9 3.5-1.5-.6-.9 1.2-.5-3.1" />
          </svg>
        </span>
        <span className={s.lensHandle} />
      </div>

      {/* Left callouts */}
      {callouts.map((c, i) => {
        const Icon = c.icon;
        return (
          <motion.div
            key={c.title}
            data-mhide
            className={s.callout}
            style={{ top: c.top, left: i === 1 ? 14 : 0 } as CSSProperties}
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.7 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <Icon className={s.calloutIcon} aria-hidden />
            <div>
              <p className={s.calloutTitle}>{c.title}</p>
              <p className={s.calloutBody}>{c.body}</p>
            </div>
          </motion.div>
        );
      })}

      {/* SLA monitoring */}
      <div className={s.sla} data-mhide>
        <Gauge className={s.slaIcon} aria-hidden />
        <div className={s.slaText}>
          <p className={s.calloutTitle}>SLA monitoring</p>
          <p className={s.calloutBody}>Track case progress and turnaround time.</p>
          <div className={s.slaBar} aria-label={`Case progress ${progress}%`}>
            <i style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Audit trail */}
      <div className={s.audit} data-mhide>
        <p className={s.auditTitle}>
          <Layers aria-hidden />
          Audit trail
        </p>
        <ol className={s.auditList} aria-live="polite">
          {audit.map((a, i) => {
            const state = i < stage ? "done" : i === stage ? "current" : "pending";
            return (
              <li key={a.label} className={s.auditItem} data-state={state}>
                <span className={s.auditDot} aria-hidden>
                  {state === "done" ? <Check /> : null}
                </span>
                <span>
                  <span className={s.auditLabel}>{a.label}</span>
                  <span className={s.auditSub}>
                    {state === "done" ? a.time : state === "current" ? a.current : "Pending"}
                  </span>
                </span>
                <span className="sr-only">
                  {state === "done" ? " — complete" : state === "current" ? " — current step" : " — pending"}
                </span>
              </li>
            );
          })}
        </ol>
        <p className={cx(s.auditOutcome, stage === stages.length - 1 && s.auditOutcomeOn)}>
          <Flag aria-hidden /> {stage === stages.length - 1 ? "Outcome reported" : "Outcome after admin gate"}
        </p>
      </div>

    </ScaledStage>
    <PhoneOnly>
      <div className={s.phoneCase}>
        <p className={s.phoneHead}>
          <Layers aria-hidden /> Audit trail <span>{progress}% complete</span>
        </p>
        <div className={s.phoneBar} aria-hidden>
          <i style={{ width: `${progress}%` }} />
        </div>
        <ol className={s.phoneList}>
          {audit.map((a, i) => {
            const state = i < stage ? "done" : i === stage ? "current" : "pending";
            return (
              <li key={a.label} data-state={state}>
                <span className={s.phoneDot} aria-hidden>
                  {state === "done" ? <Check /> : null}
                </span>
                <b>{a.label}</b>
                <small>{state === "done" ? a.time : state === "current" ? a.current : "Pending"}</small>
              </li>
            );
          })}
        </ol>
        <ul className={s.phoneChecks}>
          {callouts.map((c) => {
            const Icon = c.icon;
            return (
              <li key={c.title}>
                <Icon aria-hidden /> {c.title}
              </li>
            );
          })}
        </ul>
      </div>
    </PhoneOnly>
    </>
  );
}

function Laurel({ flip }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 24 48" className={s.laurel} style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <path d="M18 46 C 6 36, 4 20, 12 4" fill="none" stroke="currentColor" strokeWidth="1.4" />
      {[8, 16, 24, 32, 40].map((y, i) => (
        <ellipse
          key={y}
          cx={y < 20 ? 9 + i : 8 + i * 0.6}
          cy={y}
          rx="3.6"
          ry="1.7"
          transform={`rotate(${-40 + i * 6} ${y < 20 ? 9 + i : 8 + i * 0.6} ${y})`}
          fill="currentColor"
          opacity="0.85"
        />
      ))}
    </svg>
  );
}
