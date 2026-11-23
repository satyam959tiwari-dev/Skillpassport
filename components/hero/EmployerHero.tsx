"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Bookmark,
  CalendarCheck,
  ClipboardCheck,
  CodeXml,
  FileText,
  GraduationCap,
  Layers,
  Play,
  Search,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { cx } from "@/lib/utils";
import {
  AudienceHeroShell,
  PhoneOnly,
  ScaledStage,
  accentTitle,
  useHeroReducedMotion,
  type HeroCta,
} from "./HeroKit";
import s from "./EmployerHero.module.css";

type Props = {
  eyebrow: string;
  primaryCta: HeroCta;
  secondaryCta: HeroCta;
};

/* ------------------------------------------------------------------ */
/* Illustrative sample data (no real people)                           */
/* ------------------------------------------------------------------ */

type StageId = "discover" | "evaluate" | "interview";
type CandId = "a" | "b" | "c";
type Tone = "ok" | "warn" | "info";

const stages: { id: StageId; label: string; icon: LucideIcon }[] = [
  { id: "discover", label: "Discover", icon: Search },
  { id: "evaluate", label: "Evaluate", icon: Layers },
  { id: "interview", label: "Interview", icon: CalendarCheck },
];

const rowIcon: Record<StageId, LucideIcon[]> = {
  discover: [Search, FileText, Users],
  evaluate: [GraduationCap, ClipboardCheck, Users],
  interview: [CalendarCheck, Users, ShieldCheck],
};

type Row = { label: string; status: string; tone: Tone };

const candidates: Record<
  CandId,
  {
    name: string;
    role: string;
    skills: { label: string; icon: "react" | "ts" | "a11y" | "code" }[];
    verification: { label: string; tone: Tone };
    rows: Record<StageId, Row[]>;
  }
> = {
  a: {
    name: "Candidate A",
    role: "Frontend Engineer",
    skills: [
      { label: "React", icon: "react" },
      { label: "Node.js", icon: "code" },
      { label: "Testing", icon: "code" },
    ],
    verification: { label: "Verified", tone: "ok" },
    rows: {
      discover: [
        { label: "Skills match", status: "3 of 3 skills", tone: "ok" },
        { label: "Evidence", status: "Video · Files", tone: "info" },
        { label: "Availability", status: "Open to roles", tone: "ok" },
      ],
      evaluate: [
        { label: "Credentials", status: "Verified", tone: "ok" },
        { label: "Assessment", status: "Graded", tone: "ok" },
        { label: "Expert review", status: "Completed", tone: "ok" },
      ],
      interview: [
        { label: "Interview", status: "Scheduled", tone: "info" },
        { label: "Panel", status: "2 reviewers", tone: "info" },
        { label: "Decision", status: "With your team", tone: "warn" },
      ],
    },
  },
  b: {
    name: "Candidate B",
    role: "Frontend Engineer",
    skills: [
      { label: "React", icon: "react" },
      { label: "TypeScript", icon: "ts" },
      { label: "Accessibility", icon: "a11y" },
    ],
    verification: { label: "In review", tone: "warn" },
    rows: {
      discover: [
        { label: "Skills match", status: "3 of 3 skills", tone: "ok" },
        { label: "Evidence", status: "Video · Audio · Files", tone: "info" },
        { label: "Availability", status: "Open to roles", tone: "ok" },
      ],
      evaluate: [
        { label: "Credentials", status: "Verification in review", tone: "warn" },
        { label: "Assessment", status: "Submitted", tone: "ok" },
        { label: "Expert review", status: "Available", tone: "ok" },
      ],
      interview: [
        { label: "Interview", status: "Not scheduled", tone: "warn" },
        { label: "Panel", status: "Assign reviewers", tone: "info" },
        { label: "Decision", status: "With your team", tone: "warn" },
      ],
    },
  },
  c: {
    name: "Candidate C",
    role: "Frontend Engineer",
    skills: [
      { label: "Vue", icon: "code" },
      { label: "CSS", icon: "code" },
      { label: "Accessibility", icon: "a11y" },
    ],
    verification: { label: "Pending", tone: "warn" },
    rows: {
      discover: [
        { label: "Skills match", status: "2 of 3 skills", tone: "warn" },
        { label: "Evidence", status: "Files", tone: "info" },
        { label: "Availability", status: "From next month", tone: "info" },
      ],
      evaluate: [
        { label: "Credentials", status: "Pending upload", tone: "warn" },
        { label: "Assessment", status: "In progress", tone: "info" },
        { label: "Expert review", status: "Not requested", tone: "info" },
      ],
      interview: [
        { label: "Interview", status: "Not scheduled", tone: "warn" },
        { label: "Panel", status: "—", tone: "info" },
        { label: "Decision", status: "With your team", tone: "warn" },
      ],
    },
  },
};

const order: CandId[] = ["a", "b", "c"];

const features: { icon: LucideIcon; label: [string, string] }[] = [
  { icon: Layers, label: ["Evidence-first", "search"] },
  { icon: ClipboardCheck, label: ["Structured", "assessment"] },
  { icon: Users, label: ["Human-led", "decisions"] },
];

/* ------------------------------------------------------------------ */

export function EmployerHero({ eyebrow, primaryCta, secondaryCta }: Props) {
  const [stage, setStage] = useState<StageId>("evaluate");
  const [focus, setFocus] = useState<CandId>("b");

  return (
    <AudienceHeroShell
      layout="overlap"
      ariaLabel="SkillPassport for employers"
      eyebrow={eyebrow}
      title={
        <>
          <span className="block">{accentTitle("Hire beyond", "beyond")}</span>
          <span className="block">the resume.</span>
        </>
      }
      titleClassName={s.title}
      description="Discover talent through skills, credentials, assessments and evidence—then make confident, human-led hiring decisions."
      primaryCta={primaryCta}
      primaryIcon={<Play aria-hidden />}
      secondaryCta={secondaryCta}
      extra={
        <ul className={s.features}>
          {features.map(({ icon: Icon, label }) => (
            <li key={label[0]}>
              <Icon aria-hidden />
              <span>
                {label[0]}
                <br />
                {label[1]}
              </span>
            </li>
          ))}
        </ul>
      }
      scene={
        <div className={s.sceneCol}>
          <PhoneOnly>
            <div className={s.phonePicker} role="group" aria-label="Choose a candidate">
              {order.map((id) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={focus === id}
                  className={cx(s.phonePick, focus === id && s.phonePickOn)}
                  onClick={() => setFocus(id)}
                >
                  {candidates[id].name}
                </button>
              ))}
            </div>
          </PhoneOnly>
          <HiringScene stage={stage} focus={focus} onFocus={setFocus} />
          <FlowBar stage={stage} onStage={setStage} />
          <p className={s.people}>
            <Users aria-hidden />
            Hiring decisions stay with people
          </p>
        </div>
      }
    />
  );
}

/* ------------------------------------------------------------------ */

function FlowBar({ stage, onStage }: { stage: StageId; onStage: (s: StageId) => void }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % stages.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + stages.length) % stages.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = stages.length - 1;
    if (next < 0) return;
    e.preventDefault();
    onStage(stages[next].id);
    refs.current[next]?.focus();
  };
  return (
    <div className={s.flow} role="tablist" aria-label="Hiring stage">
      {stages.map((st, i) => {
        const Icon = st.icon;
        const on = st.id === stage;
        return (
          <div key={st.id} className={s.flowItem}>
            {i > 0 ? <ArrowRight className={s.flowArrow} aria-hidden /> : null}
            <button
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`emp-stage-${st.id}`}
              aria-selected={on}
              aria-controls="emp-candidate-panel"
              tabIndex={on ? 0 : -1}
              className={cx(s.flowBtn, on && s.flowBtnOn)}
              onClick={() => onStage(st.id)}
              onKeyDown={(e) => onKey(e, i)}
            >
              <Icon aria-hidden />
              {st.label}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function SkillIcon({ kind }: { kind: "react" | "ts" | "a11y" | "code" }) {
  if (kind === "ts") return <span className={s.tsIcon} aria-hidden>TS</span>;
  if (kind === "react")
    return (
      <svg viewBox="0 0 24 24" className={s.skillSvg} aria-hidden>
        <g fill="none" stroke="currentColor" strokeWidth="1.3">
          <ellipse cx="12" cy="12" rx="10" ry="4" />
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
        </g>
        <circle cx="12" cy="12" r="1.8" fill="currentColor" />
      </svg>
    );
  if (kind === "a11y")
    return (
      <svg viewBox="0 0 24 24" className={s.skillSvg} aria-hidden>
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="7" r="1.6" fill="currentColor" />
        <path d="M7 10h10M12 10v4l-3 4M12 14l3 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  return <CodeXml className={s.skillSvg} aria-hidden />;
}

function SideCard({ id, side, onFocus }: { id: CandId; side: "left" | "right"; onFocus: (id: CandId) => void }) {
  const c = candidates[id];
  return (
    <button
      type="button"
      data-mhide
      className={cx(s.side, side === "left" ? s.sideLeft : s.sideRight)}
      onClick={() => onFocus(id)}
      aria-label={`Focus ${c.name}`}
    >
      <span className={s.sideInner}>
        <span className={s.sideHead}>
          <FileText aria-hidden />
          <span>
            <b>{c.name}</b>
            <small>{c.role}</small>
          </span>
        </span>
        <i className={s.skel} style={{ width: "86%" }} />
        <i className={s.skel} style={{ width: "62%" }} />
        {[GraduationCap, ClipboardCheck, Users].map((Icon, k) => (
          <span key={k} className={s.sideRow}>
            <Icon aria-hidden />
            <span>
              <i className={s.skel} style={{ width: `${78 - k * 12}%` }} />
              <i className={s.skel} style={{ width: `${54 - k * 8}%` }} />
            </span>
          </span>
        ))}
      </span>
    </button>
  );
}

function HiringScene({
  stage,
  focus,
  onFocus,
}: {
  stage: StageId;
  focus: CandId;
  onFocus: (id: CandId) => void;
}) {
  const reduce = useHeroReducedMotion();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const c = candidates[focus];
  const others = order.filter((o) => o !== focus) as [CandId, CandId];
  const icons = rowIcon[stage];
  const orbit = "M 22,352 a 448,118 0 1,0 896,0 a 448,118 0 1,0 -896,0";

  return (
    <ScaledStage
      width={940}
      height={600}
      label="Candidate comparison"
      className={s.stageWrap}
      focus={{ x: 278, y: 96, w: 384, h: 436 }}
    >
      {/* Arc + orbit */}
      <svg className={s.back} viewBox="0 0 940 600" aria-hidden>
        <defs>
          <linearGradient id={`${uid}-arc`} x1="0" x2="1">
            <stop offset="0" stopColor="#6a46e8" stopOpacity="0.1" />
            <stop offset="0.25" stopColor="#3387f2" stopOpacity="0.9" />
            <stop offset="0.5" stopColor="#d6ecff" />
            <stop offset="0.75" stopColor="#3387f2" stopOpacity="0.9" />
            <stop offset="1" stopColor="#6a46e8" stopOpacity="0.1" />
          </linearGradient>
          <radialGradient id={`${uid}-disc`} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#eaf5ff" />
            <stop offset="0.3" stopColor="#62acfa" stopOpacity="0.8" />
            <stop offset="1" stopColor="#1071fa" stopOpacity="0" />
          </radialGradient>
          <filter id={`${uid}-g`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path className={s.arcWide} d="M70 440 A400 400 0 0 1 870 440" stroke={`url(#${uid}-arc)`} />
        <path className={cx(s.arc, !reduce && s.arcPulse)} d="M70 440 A400 400 0 0 1 870 440" stroke={`url(#${uid}-arc)`} filter={`url(#${uid}-g)`} />
        <path className={s.arcInner} d="M120 440 A350 350 0 0 1 820 440" />
        <path className={s.orbit} d={orbit} />
        {!reduce ? (
          <circle r="4" className={s.orb} filter={`url(#${uid}-g)`} opacity="0">
            <animateMotion dur="14s" repeatCount="indefinite" path={orbit} />
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="14s" repeatCount="indefinite" />
          </circle>
        ) : null}
        {/* platform */}
        <ellipse cx="470" cy="500" rx="300" ry="54" className={s.discBase} />
        <ellipse cx="470" cy="492" rx="250" ry="40" className={cx(s.discRing, !reduce && s.discSpin)} />
        <ellipse cx="470" cy="486" rx="230" ry="34" fill={`url(#${uid}-disc)`} />
        <ellipse cx="470" cy="484" rx="170" ry="20" className={s.discHot} filter={`url(#${uid}-g)`} />
        <ellipse cx="470" cy="486" rx="320" ry="62" className={s.discOuter} />
      </svg>

      {/* Side candidates */}
      <SideCard id={others[0]} side="left" onFocus={onFocus} />
      <SideCard id={others[1]} side="right" onFocus={onFocus} />

      {/* Floating badges */}
      <div className={cx(s.badge, s.badgeEvidence, !reduce && s.bob)} data-mhide>
        <span className={s.playRing} aria-hidden>
          <Play />
        </span>
        <span>
          <b>Assessment evidence</b>
          <small>Video · Audio · Files</small>
        </span>
      </div>
      <div className={cx(s.badge, s.badgeStatus, !reduce && s.bobAlt)} data-mhide>
        <ShieldCheck className={s.badgeShield} aria-hidden />
        <span>
          <b>Verification status:</b>
          <AnimatePresence mode="wait" initial={false}>
            <motion.em
              key={c.verification.label}
              className={s[`tone_${c.verification.tone}`]}
              initial={reduce ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
            >
              {c.verification.label}
            </motion.em>
          </AnimatePresence>
        </span>
      </div>
      <span className={cx(s.chipIcon, s.ci1)} data-mhide aria-hidden><CodeXml /></span>
      <span className={cx(s.chipIcon, s.ci2)} data-mhide aria-hidden><Layers /></span>
      <span className={cx(s.chipIcon, s.ci3)} data-mhide aria-hidden><GraduationCap /></span>
      <span className={cx(s.chipIcon, s.ci4)} data-mhide aria-hidden><ShieldCheck /></span>

      {/* Focus card */}
      <div className={cx(s.mainWrap, !reduce && s.mainFloat)}>
        <div className={s.main} role="tabpanel" id="emp-candidate-panel" aria-labelledby={`emp-stage-${stage}`} aria-live="polite">
          <Bookmark className={s.bookmark} aria-hidden />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${focus}-${stage}`}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className={s.mainHead}>
                <span className={s.docIcon} aria-hidden>
                  <FileText />
                </span>
                <div>
                  <h2>{c.name}</h2>
                  <p>{c.role}</p>
                </div>
              </div>
              <ul className={s.skills} aria-label="Skills">
                {c.skills.map((sk) => (
                  <li key={sk.label}>
                    <SkillIcon kind={sk.icon} />
                    {sk.label}
                  </li>
                ))}
              </ul>
              <ul className={s.rows}>
                {c.rows[stage].map((r, i) => {
                  const Icon = icons[i];
                  return (
                    <li key={r.label} className={cx(s.row, i === 0 && s.rowFirst)}>
                      <Icon aria-hidden />
                      <span className={s.rowLabel}>{r.label}</span>
                      <span className={s.dot} aria-hidden>·</span>
                      <span className={cx(s.pill, s[`pill_${r.tone}`])}>{r.status}</span>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </ScaledStage>
  );
}
