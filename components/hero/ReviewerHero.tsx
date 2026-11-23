"use client";

import Image from "next/image";
import {
  CalendarCheck,
  Captions,
  ChartColumn,
  Check,
  ClipboardList,
  FileText,
  House,
  Image as ImageIcon,
  Layers,
  Lock,
  Maximize,
  Pause,
  PencilLine,
  Play,
  Settings,
  Sparkles,
  SquareCheckBig,
  StickyNote,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useId, useRef, useState, type Dispatch, type KeyboardEvent, type SetStateAction } from "react";
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
import s from "./ReviewerHero.module.css";

type Props = {
  eyebrow: string;
  headline: string;
  accentWord: string;
  description: string;
  primaryCta: HeroCta;
  secondaryCta: HeroCta;
};

type StudioTab = "review" | "evidence" | "rubric" | "notes";
type MediaTab = "video" | "pdf" | "evidence";

const studioTabs: { id: StudioTab; label: string; icon: LucideIcon }[] = [
  { id: "review", label: "Review", icon: SquareCheckBig },
  { id: "evidence", label: "Evidence", icon: FileText },
  { id: "rubric", label: "Rubric", icon: ClipboardList },
  { id: "notes", label: "Notes", icon: StickyNote },
];

const mediaTabs: { id: MediaTab; label: string; icon: LucideIcon }[] = [
  { id: "video", label: "Video", icon: Video },
  { id: "pdf", label: "Document (PDF)", icon: FileText },
  { id: "evidence", label: "Evidence", icon: ImageIcon },
];

const criteria = [
  { id: "tech", label: "Technical accuracy", initial: 4 },
  { id: "comm", label: "Communication", initial: 5 },
  { id: "prob", label: "Problem solving", initial: 4 },
];

const builderItems = [
  { label: "Define criteria", initial: true },
  { label: "Set rating scale", initial: true },
  { label: "Add checklist items", initial: false },
  { label: "Use template", initial: false },
];

const railIcons: LucideIcon[] = [House, Layers, Users, CalendarCheck, ChartColumn, Settings];
const DURATION = 276; // 4:36 sample clip

/** Deterministic waveform heights (same on server + client). */
const wave = Array.from({ length: 46 }, (_, i) => {
  const v = Math.abs(Math.sin(i * 1.7) * 0.6 + Math.sin(i * 0.45) * 0.4);
  return Math.round(18 + v * 82);
});

const fmt = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;

export function ReviewerHero(props: Props) {
  return (
    <AudienceHeroShell
      eyebrow={props.eyebrow}
      title={accentTitle(props.headline, props.accentWord)}
      description={props.description}
      primaryCta={props.primaryCta}
      secondaryCta={props.secondaryCta}
      scene={<StudioScene />}
    />
  );
}

function StudioScene() {
  const reduce = useHeroReducedMotion();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [tab, setTab] = useState<StudioTab>("review");
  const [media, setMedia] = useState<MediaTab>("video");
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(criteria.map((c) => [c.id, c.initial])),
  );
  const [checks, setChecks] = useState(builderItems.map((b) => b.initial));
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!playing) return;
    const t = window.setInterval(() => {
      setTime((v) => (v + 1 >= DURATION ? 0 : v + 1));
    }, 1000 / 12); // 12× speed so the sample clip visibly moves
    return () => window.clearInterval(t);
  }, [playing]);

  const selectTab = (id: StudioTab) => {
    setTab(id);
    if (id === "evidence") setMedia("evidence");
    if (id === "review") setMedia("video");
  };

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % studioTabs.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + studioTabs.length) % studioTabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = studioTabs.length - 1;
    if (next < 0) return;
    e.preventDefault();
    selectTab(studioTabs[next].id);
    tabRefs.current[next]?.focus();
  };

  const avg = (Object.values(scores).reduce((a, b) => a + b, 0) / criteria.length).toFixed(1);
  const progress = (time / DURATION) * 100;

  return (
    <>
    <ScaledStage
      width={860}
      height={600}
      label="Expert assessment studio"
      className={s.stageWrap}
      focus={{ x: 30, y: 36, w: 470, h: 474 }}
    >
      <svg className={s.wires} viewBox="0 0 860 600" aria-hidden>
        <WireDefs id="rev" />
        <Wire id="rev" d="M250 52 C 360 6, 520 4, 640 40" reduce={reduce} dur={4.2} delay={0.4} />
        <Wire id="rev" d="M846 210 C 880 300, 872 420, 790 506" reduce={reduce} dur={3.8} delay={1.6} />
        <Wire id="rev" d="M40 330 C 10 420, 40 500, 128 528" reduce={reduce} dur={3.6} delay={2.4} />
      </svg>

      {/* Studio window */}
      <div className={s.window}>
        <div className={s.windowInner}>
          <div className={s.top}>
            <div className={s.dots} aria-hidden>
              <i />
              <i />
              <i />
            </div>
          </div>
          <div className={s.main}>
            <div className={s.rail} aria-hidden>
              {railIcons.map((Icon, i) => (
                <div key={i} className={i === 1 ? s.railActive : undefined}>
                  <Icon />
                </div>
              ))}
            </div>
            <div className={s.content}>
              <h2 className={s.heading}>
                <Layers aria-hidden />
                Expert Assessment Studio
              </h2>
              <div className={s.tabs} role="tablist" aria-label="Studio views">
                {studioTabs.map((t, i) => {
                  const Icon = t.icon;
                  const active = t.id === tab;
                  return (
                    <button
                      key={t.id}
                      ref={(el) => {
                        tabRefs.current[i] = el;
                      }}
                      type="button"
                      role="tab"
                      id={`${uid}-tab-${t.id}`}
                      aria-selected={active}
                      aria-controls={`${uid}-panel`}
                      tabIndex={active ? 0 : -1}
                      className={cx(s.tab, active && s.tabActive)}
                      onClick={() => selectTab(t.id)}
                      onKeyDown={(e) => onTabKey(e, i)}
                    >
                      <Icon aria-hidden />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              <div
                className={s.panels}
                role="tabpanel"
                id={`${uid}-panel`}
                aria-labelledby={`${uid}-tab-${tab}`}
              >
                {/* Media review */}
                <div className={cx(s.panel, s.mediaPanel, tab === "evidence" && s.panelFocus)}>
                  <div className={s.mediaTabs} role="group" aria-label="Media type">
                    {mediaTabs.map((m) => {
                      const Icon = m.icon;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          aria-pressed={media === m.id}
                          className={cx(s.mediaTab, media === m.id && s.mediaTabActive)}
                          onClick={() => setMedia(m.id)}
                        >
                          <Icon aria-hidden />
                          {m.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className={s.preview}>
                    {media === "video" ? (
                      <VideoFrame playing={playing} onToggle={() => setPlaying((p) => !p)} />
                    ) : media === "pdf" ? (
                      <PdfFrame />
                    ) : (
                      <EvidenceFrame />
                    )}
                    {media === "video" ? (
                      <div className={s.reviewNote} aria-hidden>
                        <span>Review note</span>
                        <i />
                        <i />
                      </div>
                    ) : null}
                  </div>

                  <div className={s.controls}>
                    <button
                      type="button"
                      className={s.ctrlPlay}
                      aria-label={playing ? "Pause clip" : "Play clip"}
                      onClick={() => {
                        setMedia("video");
                        setPlaying((p) => !p);
                      }}
                    >
                      {playing ? <Pause aria-hidden /> : <Play aria-hidden />}
                    </button>
                    <span className={s.time}>
                      {fmt(time)} / {fmt(DURATION)}
                    </span>
                    <div className={s.wave} aria-hidden>
                      {wave.map((h, i) => (
                        <i
                          key={i}
                          style={{ height: `${h}%` }}
                          className={(i / wave.length) * 100 <= progress ? s.waveOn : undefined}
                        />
                      ))}
                      <span className={s.marker} style={{ left: "30%" }} data-tone="amber" />
                      <span className={s.marker} style={{ left: "58%" }} data-tone="cyan" />
                      <span className={s.playhead} style={{ left: `${progress}%` }} />
                    </div>
                    <Captions className={s.ctrlIcon} aria-hidden />
                    <Maximize className={s.ctrlIcon} aria-hidden />
                  </div>
                </div>

                {/* Rubric scoring */}
                <div className={s.side} data-mhide>
                  <div className={cx(s.panel, s.rubric, tab === "rubric" && s.panelFocus)}>
                    <div className={s.rubricHead}>
                      <ClipboardList aria-hidden />
                      <span>Rubric Scoring</span>
                      <span className={s.inReview}>
                        <i aria-hidden />
                        In Review
                      </span>
                    </div>
                    <Criteria idp={uid} scores={scores} setScores={setScores} />
                    <p className={s.avg} aria-live="polite">
                      Draft average <strong>{avg}</strong> / 5
                    </p>
                  </div>
                  <div className={cx(s.panel, s.note, tab === "notes" && s.panelFocus)}>
                    <p className={s.noteHead}>
                      <PencilLine aria-hidden />
                      Reviewer note
                    </p>
                    <div className={s.noteLines} aria-hidden>
                      <i />
                      <i />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rubric builder */}
      <div className={s.builder} data-mhide>
        <p className={s.builderHead}>
          <Layers aria-hidden />
          Rubric builder
        </p>
        <ul className={s.builderList}>
          {builderItems.map((b, i) => (
            <li key={b.label}>
              <label className={s.check}>
                <input
                  type="checkbox"
                  checked={checks[i]}
                  onChange={() => setChecks((v) => v.map((x, j) => (j === i ? !x : x)))}
                />
                <span className={s.box} aria-hidden>
                  <Check />
                </span>
                {b.label}
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom badges */}
      <div className={s.aiBadge} data-mhide>
        <Sparkles aria-hidden />
        <span>
          <strong>AI-imported draft</strong> · Review before publish
        </span>
      </div>
      <div className={s.humanBadge} data-mhide>
        <Lock aria-hidden />
        <strong>Human approval required</strong>
      </div>

    </ScaledStage>
    <PhoneOnly>
      <div className={s.phonePanel}>
        <div className={s.rubricHead}>
          <ClipboardList aria-hidden />
          <span>Rubric Scoring</span>
          <span className={s.inReview}>
            <i aria-hidden />
            In Review
          </span>
        </div>
        <Criteria idp={`${uid}m`} scores={scores} setScores={setScores} />
        <p className={s.avg} aria-live="polite">
          Draft average <strong>{avg}</strong> / 5
        </p>
      </div>
      <div className={s.phoneBadges}>
        <span>
          <Sparkles aria-hidden /> AI-imported draft · review before publish
        </span>
        <span>
          <Lock aria-hidden /> Human approval required
        </span>
      </div>
    </PhoneOnly>
    </>
  );
}

function VideoFrame({ playing, onToggle }: { playing: boolean; onToggle: () => void }) {
  return (
    <div className={s.video}>
      {/* Sample reviewer clip (paused frame) */}
      <Image
        src="/ui/reviewer-video.webp"
        alt="Video evidence: a candidate explaining their approach on a video call"
        fill
        sizes="(max-width: 639px) 90vw, 420px"
        className={s.videoArt}
        priority={false}
      />
      <span className={s.videoShade} aria-hidden />
      <button
        type="button"
        className={cx(s.bigPlay, playing && s.bigPlayHidden)}
        aria-label={playing ? "Pause clip" : "Play clip"}
        onClick={onToggle}
      >
        {playing ? <Pause aria-hidden /> : <Play aria-hidden />}
      </button>
    </div>
  );
}

function PdfFrame() {
  return (
    <div className={s.pdf} aria-label="PDF page under review" role="img">
      <div className={s.pdfPage}>
        <b />
        {[92, 80, 88, 70, 84, 60].map((w, i) => (
          <i key={i} style={{ width: `${w}%` }} />
        ))}
        <span className={s.pdfHighlight} />
      </div>
    </div>
  );
}

function EvidenceFrame() {
  const files: { icon: LucideIcon; name: string; tag: string }[] = [
    { icon: Video, name: "Walkthrough.mp4", tag: "Video" },
    { icon: FileText, name: "Design-notes.pdf", tag: "PDF" },
    { icon: ImageIcon, name: "Architecture.png", tag: "Image" },
  ];
  return (
    <ul className={s.files} aria-label="Evidence files">
      {files.map(({ icon: Icon, name, tag }) => (
        <li key={name}>
          <Icon aria-hidden />
          <span>{name}</span>
          <em>{tag}</em>
        </li>
      ))}
    </ul>
  );
}

function Criteria({
  idp,
  scores,
  setScores,
}: {
  idp: string;
  scores: Record<string, number>;
  setScores: Dispatch<SetStateAction<Record<string, number>>>;
}) {
  return (
    <>
                    {criteria.map((c) => (
                      <div key={c.id} className={s.criterion}>
                        <span className={s.critLabel} id={`${idp}-${c.id}`}>
                          {c.label}
                        </span>
                        <div className={s.critRow}>
                          <span className={s.critBar} aria-hidden>
                            <i style={{ width: `${scores[c.id] * 20}%` }} />
                          </span>
                          <div className={s.scale} role="radiogroup" aria-labelledby={`${idp}-${c.id}`}>
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button
                                key={n}
                                type="button"
                                role="radio"
                                aria-checked={scores[c.id] === n}
                                aria-label={`${n} of 5`}
                                tabIndex={scores[c.id] === n ? 0 : -1}
                                className={cx(s.scaleBtn, scores[c.id] === n && s.scaleOn)}
                                onClick={() => setScores((v) => ({ ...v, [c.id]: n }))}
                                onKeyDown={(e) => {
                                  const cur = scores[c.id];
                                  let next = 0;
                                  if (e.key === "ArrowRight" || e.key === "ArrowUp") next = Math.min(5, cur + 1);
                                  if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = Math.max(1, cur - 1);
                                  if (!next) return;
                                  e.preventDefault();
                                  setScores((v) => ({ ...v, [c.id]: next }));
                                  const group = e.currentTarget.parentElement;
                                  (group?.children[next - 1] as HTMLElement | undefined)?.focus();
                                }}
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
    </>
  );
}
