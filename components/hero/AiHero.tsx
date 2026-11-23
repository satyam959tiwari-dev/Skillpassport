"use client";

import {
  Briefcase,
  CalendarCheck,
  ChartNoAxesColumnIncreasing,
  CirclePlay,
  CloudUpload,
  FileText,
  Info,
  Layers,
  MessageCircleQuestion,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { aiShowcase, type AiShowcaseRole } from "@/lib/content";
import { AI_AUDIENCE_EVENT, openAiDemo, setAiAudience } from "@/lib/ai-events";
import { cx } from "@/lib/utils";
import { AudienceHeroShell, NotPhone, PhoneOnly, ScaledStage, useHeroReducedMotion } from "./HeroKit";
import s from "./AiHero.module.css";

type Tile = (typeof aiShowcase)[number];

const tileIcon: Record<string, LucideIcon> = {
  summary: FileText,
  assessments: ChartNoAxesColumnIncreasing,
  import: CloudUpload,
  builder: Layers,
  query: MessageCircleQuestion,
  templates: CalendarCheck,
};

/** Design-space placement of the six tiles (stage 900 × 540), small → large like the reference. */
const place: Record<string, { x: number; y: number; w: number; h: number; tone: string; delay: number }> = {
  summary: { x: 40, y: 18, w: 140, h: 150, tone: "sky", delay: -1 },
  assessments: { x: 152, y: 62, w: 148, h: 164, tone: "violet", delay: -2.8 },
  import: { x: 268, y: 110, w: 150, h: 178, tone: "sky", delay: -0.7 },
  builder: { x: 388, y: 166, w: 146, h: 182, tone: "violet", delay: -4.2 },
  query: { x: 488, y: 226, w: 168, h: 204, tone: "lav", delay: -2.2 },
  templates: { x: 604, y: 290, w: 244, h: 206, tone: "sky", delay: -5.1 },
};

const audiences: { role: AiShowcaseRole; label: string; icon: LucideIcon }[] = [
  { role: "candidate", label: "Candidates", icon: UserRound },
  { role: "reviewer", label: "Reviewers", icon: Layers },
  { role: "employer", label: "Employers", icon: Briefcase },
  { role: "admin", label: "Admins", icon: ShieldCheck },
];

/* Deterministic decorative paths (identical on server and client). */
const r1 = (n: number) => Math.round(n * 10) / 10;
const waveLines = Array.from({ length: 34 }, (_, i) => {
  const y = r1(70 + i * 3.6);
  return `M0 ${y} C180 ${r1(y - 56)} 280 ${r1(y + 94)} 453 ${r1(y + 51)} S748 ${r1(y - 45)} 864 ${r1(y + 38)} 1160 ${r1(y + 118)} 1380 ${r1(y + 14)} 1530 ${r1(y - 17)} 1648 ${r1(y + 2)}`;
});
const filaments = Array.from(
  { length: 22 },
  (_, i) =>
    `M40 ${215 + i * 2} C${60 + i * 2} ${405 + i * 4} ${190 + i * 6} ${410 + i * 3} ${330 + i * 5} ${280 + i * 2} S${680 - i * 2} ${50 + i * 4} 850 ${120 + i * 4}`,
);
const loopFilaments = Array.from(
  { length: 18 },
  (_, i) =>
    `M${470 + i * 3} ${612 - i * 2} C${760 + i * 4} ${560 - i * 3} ${930 - i * 2} ${330 + i * 3} ${880 - i * 3} ${150 + i * 4} S${560 + i * 3} ${-20 + i * 3} ${300 + i * 5} ${40 + i * 2}`,
);

export function AiHero() {
  const [role, setRole] = useState<AiShowcaseRole | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  // Stay in sync if the capability grid below changes the filter
  useEffect(() => {
    const on = (e: Event) => setRole(((e as CustomEvent).detail as AiShowcaseRole | null) ?? null);
    window.addEventListener(AI_AUDIENCE_EVENT, on);
    return () => window.removeEventListener(AI_AUDIENCE_EVENT, on);
  }, []);

  const open = (id: string, from?: HTMLElement | null) => {
    returnFocus.current = from ?? (document.activeElement as HTMLElement | null);
    setOpenId(id);
    const d = dialogRef.current;
    if (d && !d.open) d.showModal();
  };
  const close = () => {
    dialogRef.current?.close();
  };

  const pickRole = (r: AiShowcaseRole) => {
    const next = role === r ? null : r;
    setRole(next);
    setAiAudience(next);
  };

  const detail = aiShowcase.find((t) => t.id === openId) ?? null;
  const matches = role ? aiShowcase.filter((t) => t.role === role).length : aiShowcase.length;

  return (
    <>
      <AudienceHeroShell
        ariaLabel="AI on SkillPassport"
        layout="overlap"
        eyebrow="AI on SkillPassport"
        title={
          <>
            <span className="block">Intelligence</span>
            <span className="block">at work.</span>
            <span className={cx("block", s.gradientLine)}>People in control.</span>
          </>
        }
        titleClassName={s.title}
        description="Six purpose-built AI capabilities. Draft faster, assess thoughtfully, and keep every decision human-led."
        primaryCta={{ label: "Explore the six capabilities", href: "#capabilities" }}
        secondaryCta={{ label: "See them in action", href: "#demos" }}
        secondaryVariant="outline"
        secondaryIcon={<CirclePlay aria-hidden />}
        className={s.hero}
        extra={
          <p className={s.disclaimer}>
            <Info aria-hidden />
            Every AI output is a draft people review
          </p>
        }
        ground={<WaveField />}
        scene={
          <>
            <NotPhone>
              <TileStage role={role} onOpen={open} />
            </NotPhone>
            <PhoneOnly>
              <TileGrid role={role} onOpen={open} />
            </PhoneOnly>
          </>
        }
        footer={
          <div className={s.bottom}>
            <div className={s.audiences} role="group" aria-label="Filter AI capabilities by audience">
              {audiences.map(({ role: r, label, icon: Icon }) => (
                <button
                  key={r}
                  type="button"
                  className={cx(s.audience, role === r && s.audienceActive)}
                  aria-pressed={role === r}
                  onClick={() => pickRole(r)}
                >
                  <Icon aria-hidden />
                  <span>
                    <small>For</small>
                    {label}
                  </span>
                </button>
              ))}
            </div>
            <p className={s.filterStatus} aria-live="polite">
              {role
                ? `Showing ${matches} of 6 capabilities for ${audiences.find((a) => a.role === role)?.label.toLowerCase()} — select again to show all.`
                : "Select an audience to highlight its capabilities, or open any tile."}
            </p>
            <div className={s.banner}>
              <Sparkles aria-hidden />
              <span>AI proposes. You review. Nothing important happens without people.</span>
            </div>
          </div>
        }
      />

      <dialog
        ref={dialogRef}
        className={s.dialog}
        aria-labelledby="ai-detail-title"
        aria-describedby="ai-detail-desc"
        onClose={() => {
          setOpenId(null);
          returnFocus.current?.focus?.();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        {detail ? (
          <div className={s.dialogInner}>
            <div className={s.dialogHead}>
              <span className={s.dialogIcon} aria-hidden>
                {(() => {
                  const Icon = tileIcon[detail.id];
                  return <Icon />;
                })()}
              </span>
              <div>
                <p className={s.dialogTag}>{detail.audience}</p>
                <h2 id="ai-detail-title">{detail.title}</h2>
              </div>
              <button type="button" className={s.dialogClose} onClick={close} aria-label="Close details">
                <X aria-hidden />
              </button>
            </div>
            <p id="ai-detail-desc" className={s.dialogDesc}>
              {detail.description}
            </p>
            <div className={s.dialogExample}>{detail.example}</div>
            <p className={s.dialogFine}>
              AI drafts the first version; a person reviews, edits, and decides what is saved or published.
            </p>
            <div className={s.dialogActions}>
              <button
                type="button"
                className={s.dialogPrimary}
                onClick={() => {
                  const demo = detail.demoId;
                  returnFocus.current = null;
                  close();
                  window.requestAnimationFrame(() => openAiDemo(demo));
                }}
              >
                <CirclePlay aria-hidden /> Try the interactive example
              </button>
              <button type="button" className={s.dialogGhost} onClick={close}>
                Close
              </button>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}

function TileButton({
  tile,
  role,
  onOpen,
  className,
  style,
}: {
  tile: Tile;
  role: AiShowcaseRole | null;
  onOpen: (id: string, from?: HTMLElement | null) => void;
  className?: string;
  style?: CSSProperties;
}) {
  const Icon = tileIcon[tile.id];
  const dim = role !== null && tile.role !== role;
  const lit = role !== null && tile.role === role;
  return (
    <button
      type="button"
      className={cx(s.tile, dim && s.tileDim, lit && s.tileLit, className)}
      style={style}
      data-tone={place[tile.id].tone}
      data-tile={tile.id}
      aria-label={`${tile.title} — open details`}
      aria-haspopup="dialog"
      onClick={(e) => onOpen(tile.id, e.currentTarget)}
    >
      <span className={s.tileBody}>
        <span className={s.tileShine} aria-hidden />
        <span className={s.tileContent}>
          <Icon className={s.tileIcon} aria-hidden />
          <span className={s.tileLabel}>
            {tile.lines.map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
          </span>
        </span>
      </span>
    </button>
  );
}

function TileStage({
  role,
  onOpen,
}: {
  role: AiShowcaseRole | null;
  onOpen: (id: string, from?: HTMLElement | null) => void;
}) {
  const reduce = useHeroReducedMotion();
  return (
    <ScaledStage width={900} height={540} label="Six AI capabilities" className={s.stageWrap}>
      <div className={s.ambient} aria-hidden />
      <svg className={s.ribbons} viewBox="0 0 920 630" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="ai-ribbon" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#6cb8ff" />
            <stop offset=".4" stopColor="#3387f2" />
            <stop offset=".78" stopColor="#6a46e8" />
            <stop offset="1" stopColor="#b38cff" />
          </linearGradient>
          <linearGradient id="ai-ribbon-2" x1="1" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#b38cff" />
            <stop offset=".45" stopColor="#62acfa" />
            <stop offset="1" stopColor="#1071fa" />
          </linearGradient>
          <filter id="ai-bloom" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g className={s.fine}>
          {filaments.map((d, i) => (
            <path key={`f${i}`} d={d} />
          ))}
          {loopFilaments.map((d, i) => (
            <path key={`l${i}`} d={d} />
          ))}
        </g>
        <path className={s.ribbonBase} d="M17 201 C-80 22 232 8 398 95 S759 40 899 90 791 324 544 375 180 476 177 543 637 663 892 430" />
        <path className={s.ribbonBase} d="M35 240 C-13 366 215 442 367 249 S731-5 884 179 778 409 525 499 371 600 925 584" />
        <path className={s.ribbonBand} stroke="url(#ai-ribbon)" d="M17 201 C-80 22 232 8 398 95 S759 40 899 90 791 324 544 375 180 476 177 543 637 663 892 430" />
        <path className={s.ribbonBand} stroke="url(#ai-ribbon-2)" d="M35 240 C-13 366 215 442 367 249 S731-5 884 179 778 409 525 499 371 600 925 584" />
        <path className={s.ribbonCore} stroke="url(#ai-ribbon)" d="M17 201 C-80 22 232 8 398 95 S759 40 899 90 791 324 544 375 180 476 177 543 637 663 892 430" />
        <path className={s.ribbonCore} stroke="url(#ai-ribbon-2)" d="M35 240 C-13 366 215 442 367 249 S731-5 884 179 778 409 525 499 371 600 925 584" />
        <path
          className={cx(s.ribbonGlow, !reduce && s.flow)}
          stroke="url(#ai-ribbon)"
          d="M17 201 C-80 22 232 8 398 95 S759 40 899 90 791 324 544 375 180 476 177 543 637 663 892 430"
        />
        <path
          className={cx(s.ribbonGlow, !reduce && s.flowSlow)}
          stroke="url(#ai-ribbon-2)"
          d="M35 240 C-13 366 215 442 367 249 S731-5 884 179 778 409 525 499 371 600 925 584"
        />
        <ellipse className={cx(s.halo, !reduce && s.breathe)} cx="525" cy="340" rx="345" ry="172" />
      </svg>

      <div className={s.cluster}>
        {aiShowcase.map((t) => {
          const p = place[t.id];
          return (
            <TileButton
              key={t.id}
              tile={t}
              role={role}
              onOpen={onOpen}
              className={cx(s.tileAbs, !reduce && s.floating)}
              style={
                {
                  left: p.x,
                  top: p.y,
                  width: p.w,
                  height: p.h,
                  "--delay": `${p.delay}s`,
                  "--fs": `${Math.round(15 + (p.w - 140) * 0.05)}px`,
                } as CSSProperties
              }
            />
          );
        })}
      </div>
    </ScaledStage>
  );
}

function TileGrid({
  role,
  onOpen,
}: {
  role: AiShowcaseRole | null;
  onOpen: (id: string, from?: HTMLElement | null) => void;
}) {
  return (
    <div className={s.grid} aria-label="Six AI capabilities">
      <div className={s.gridGlow} aria-hidden />
      {aiShowcase.map((t) => (
        <TileButton key={t.id} tile={t} role={role} onOpen={onOpen} className={s.tileFlat} />
      ))}
    </div>
  );
}

function WaveField() {
  return (
    <svg className={s.wave} viewBox="0 0 1648 230" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="ai-wave" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#6a46e8" />
          <stop offset=".32" stopColor="#3387f2" />
          <stop offset=".68" stopColor="#1071fa" />
          <stop offset="1" stopColor="#6a46e8" />
        </linearGradient>
      </defs>
      <g className={s.waveLines}>
        {waveLines.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <path className={s.waveBright} d="M0 120 C150 120 250 218 400 184 S700 101 839 169 1110 224 1290 162 1450 82 1648 100" />
    </svg>
  );
}
