import {
  Award,
  Briefcase,
  Building2,
  ClipboardCheck,
  Layers,
  ShieldCheck,
  Users,
} from "lucide-react";
import { TravelPulse } from "@/components/ui/TravelPulse";
import { Reveal } from "@/components/ui/Reveal";

const orbitNodes = [
  { label: "Skills", icon: Layers, angle: -90 },
  { label: "Credentials", icon: Award, angle: -30 },
  { label: "Organizations", icon: Building2, angle: 30 },
  { label: "Opportunities", icon: Briefcase, angle: 90 },
  { label: "People", icon: Users, angle: 150 },
  { label: "Assessments", icon: ClipboardCheck, angle: 210 },
] as const;

const sideCards = [
  {
    title: "Verified proof",
    description:
      "Turn skills, credentials, and assessments into trusted, verifiable proof that organizations can rely on.",
    icon: ShieldCheck,
  },
  {
    title: "Connected opportunities",
    description:
      "Bring people, organizations, and opportunities together through a single, trusted layer.",
    icon: Layers,
  },
] as const;

function polar(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  // String coords — avoids SSR/client float hydration mismatches on SVG attrs.
  return {
    x: (50 + Math.cos(rad) * radius).toFixed(4),
    y: (50 + Math.sin(rad) * radius).toFixed(4),
  };
}

/** Quadratic curve from hub edge → node tip (curvy spokes from the mock). */
function curvePath(angleDeg: number, rInner: number, rOuter: number) {
  const a = polar(angleDeg, rInner);
  const b = polar(angleDeg, rOuter);
  const midAngle = angleDeg + (angleDeg % 60 === 0 ? 10 : -8);
  const c = polar(midAngle, (rInner + rOuter) / 2);
  return `M ${a.x} ${a.y} Q ${c.x} ${c.y} ${b.x} ${b.y}`;
}

function NodePill({
  label,
  icon: Icon,
}: {
  label: string;
  icon: (typeof orbitNodes)[number]["icon"];
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-[rgb(98_172_250/0.4)] bg-[rgb(8_14_42/0.82)] py-2 pr-3.5 pl-2 shadow-[0_0_30px_rgb(98_172_250/0.25),inset_0_1px_0_rgb(255_255_255/0.1)] backdrop-blur-xl">
      <span className="inline-flex size-8 items-center justify-center rounded-xl border border-[rgb(98_172_250/0.35)] bg-[linear-gradient(160deg,rgb(98_172_250/0.35),rgb(16_113_250/0.12))] text-[var(--color-sky)] shadow-[0_0_18px_rgb(98_172_250/0.4)]">
        <Icon className="size-3.5" aria-hidden />
      </span>
      <span className="whitespace-nowrap text-[13px] font-medium text-white sm:text-sm">
        {label}
      </span>
    </div>
  );
}

function TrustOrb({ size = "lg" }: { size?: "lg" | "sm" }) {
  const box = size === "lg" ? "size-[9.5rem] lg:size-[11rem]" : "size-[7.5rem]";
  return (
    <div className="relative flex flex-col items-center">
      <div
        className="absolute -inset-12 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgb(98 172 250 / 0.55), rgb(16 113 250 / 0.2) 40%, transparent 70%)",
        }}
        aria-hidden
      />
      {/* orbit rings */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 size-[140%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgb(98_172_250/0.18)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 size-[175%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[rgb(98_172_250/0.12)]"
        aria-hidden
      />

      {/* translucent glass globe — not a solid disc */}
      <div
        className={`relative flex ${box} flex-col items-center justify-center rounded-full`}
        style={{
          background:
            "radial-gradient(circle at 32% 28%, rgb(168 212 255 / 0.55) 0%, rgb(98 172 250 / 0.28) 28%, rgb(51 135 242 / 0.18) 52%, rgb(22 17 82 / 0.35) 78%, rgb(9 13 51 / 0.15) 100%)",
          boxShadow:
            "0 0 50px rgb(98 172 250 / 0.55), 0 0 100px rgb(16 113 250 / 0.3), inset 0 0 40px rgb(255 255 255 / 0.18), inset 0 -20px 40px rgb(9 13 51 / 0.25)",
          border: "1px solid rgb(168 212 255 / 0.45)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-[8%] rounded-full"
          style={{
            background:
              "radial-gradient(circle at 30% 22%, rgb(255 255 255 / 0.45), transparent 48%)",
          }}
          aria-hidden
        />
        <span className="relative mb-2 flex flex-col items-center gap-[3px]" aria-hidden>
          <span className="block h-[7px] w-10 rounded-[2px] bg-white shadow-[0_0_12px_rgb(255_255_255/0.7)]" />
          <span className="block h-[7px] w-7 rounded-[2px] bg-white/95" />
          <span className="block h-[7px] w-5 rounded-[2px] bg-white/90" />
        </span>
        <p className="relative text-[11px] font-semibold tracking-wide text-white sm:text-xs">
          SkillPassport
        </p>
        <p className="relative mt-0.5 text-[9px] font-medium tracking-[0.18em] text-[rgb(200_230_255)] uppercase sm:text-[10px]">
          Trust layer
        </p>
      </div>
    </div>
  );
}

/** Core positioning — 1:1 with public/ui ChatGPT 04_12_13 mock. */
export function CorePositioning() {
  return (
    <section
      id="story"
      className="sp-section relative overflow-hidden bg-[linear-gradient(180deg,#090d33_0%,#0c1240_50%,#120f47_100%)]"
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(50% 40% at 75% 8%, rgb(98 172 250 / 0.16), transparent 55%), radial-gradient(35% 30% at 8% 92%, rgb(82 36 212 / 0.2), transparent 60%)",
        }}
      />

      <div className="sp-container relative">
        <Reveal className="max-w-3xl">
          <p className="sp-eyebrow">Core positioning</p>
          <h2 className="sp-heading mt-4 text-[clamp(32px,4vw,52px)]">
            The trust layer for skills and{" "}
            <span className="sp-gradient-text">careers.</span>
          </h2>
          <p className="sp-lede mt-4 max-w-2xl">
            SkillPassport is the trust layer connecting skills, credentials, people,
            organizations, assessments, and opportunities — more than a job board or digital
            resume.
          </p>
        </Reveal>

        <div className="mt-8 grid items-stretch gap-3 lg:grid-cols-[minmax(0,1.25fr)_minmax(240px,0.75fr)] lg:gap-3">
          <Reveal className="relative flex items-center overflow-hidden rounded-[22px] border border-[rgb(98_172_250/0.22)] bg-[linear-gradient(165deg,rgb(18_22_70/0.75),rgb(9_13_51/0.7))] p-3 shadow-[0_0_0_1px_rgb(98_172_250/0.06),0_24px_60px_rgb(0_0_0/0.4),inset_0_1px_0_rgb(255_255_255/0.07)] backdrop-blur-xl sm:p-4">
            <div
              className="pointer-events-none absolute inset-0 rounded-[22px]"
              aria-hidden
              style={{
                background:
                  "radial-gradient(circle at 50% 48%, rgb(51 135 242 / 0.22), transparent 42%)",
              }}
            />

            {/* Desktop orbit — sized to sync with right cards */}
            <div className="relative mx-auto hidden aspect-square w-full max-w-[400px] sm:block">
              <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" aria-hidden>
                <defs>
                  <linearGradient id="sp-curve" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#c8e4ff" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#3387f2" stopOpacity="0.25" />
                  </linearGradient>
                  <filter id="sp-curve-glow" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="0.45" result="b" />
                    <feMerge>
                      <feMergeNode in="b" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <mask id="sp-spokes-mask">
                    <rect x="0" y="0" width="100" height="100" fill="white" />
                    <circle cx="50" cy="50" r="16" fill="black" />
                  </mask>
                </defs>
                <circle
                  cx="50"
                  cy="50"
                  r="22"
                  fill="none"
                  stroke="rgb(98 172 250 / 0.12)"
                  strokeWidth="0.25"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="28"
                  fill="none"
                  stroke="rgb(98 172 250 / 0.1)"
                  strokeWidth="0.2"
                  strokeDasharray="1.2 1.4"
                />
                <g mask="url(#sp-spokes-mask)">
                  {orbitNodes.map((node) => {
                    const d = curvePath(node.angle, 16, 34);
                    return (
                      <g key={node.label} filter="url(#sp-curve-glow)">
                        <path
                          d={d}
                          fill="none"
                          stroke="url(#sp-curve)"
                          strokeWidth="0.45"
                          strokeLinecap="round"
                        />
                      </g>
                    );
                  })}
                </g>
                {/* Pulses outside filters — SVG filters freeze/clip SMIL motion */}
                <g mask="url(#sp-spokes-mask)" style={{ pointerEvents: "none" }}>
                  {orbitNodes.map((node, i) => (
                    <TravelPulse
                      key={`pulse-${node.label}`}
                      path={curvePath(node.angle, 16, 34)}
                      duration={2.6 + (i % 3) * 0.35}
                      delay={i * 0.45}
                      r={0.85}
                      glowR={1.9}
                    />
                  ))}
                </g>
              </svg>

              <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
                <TrustOrb size="lg" />
              </div>

              {orbitNodes.map((node) => {
                const pos = polar(node.angle, 41);
                return (
                  <div
                    key={node.label}
                    className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  >
                    <NodePill label={node.label} icon={node.icon} />
                  </div>
                );
              })}
            </div>

            {/* Mobile */}
            <div className="relative flex flex-col items-center gap-8 py-6 sm:hidden">
              <TrustOrb size="sm" />
              <div className="flex flex-wrap justify-center gap-2.5">
                {orbitNodes.map((node) => (
                  <NodePill key={node.label} label={node.label} icon={node.icon} />
                ))}
              </div>
            </div>
          </Reveal>

          <div className="flex flex-col gap-3">
            {sideCards.map(({ title, description, icon: Icon }) => (
              <Reveal
                key={title}
                className="flex flex-1 flex-col justify-center gap-2.5 rounded-[18px] border border-[rgb(98_172_250/0.2)] bg-[linear-gradient(165deg,rgb(18_22_70/0.78),rgb(9_13_51/0.72))] px-4 py-5 shadow-[0_12px_32px_rgb(0_0_0/0.28),inset_0_1px_0_rgb(255_255_255/0.06)] backdrop-blur-xl sm:px-5"
              >
                <span className="inline-flex size-9 items-center justify-center rounded-lg border border-[rgb(98_172_250/0.4)] bg-[linear-gradient(160deg,rgb(98_172_250/0.35),rgb(16_113_250/0.12))] text-[var(--color-sky)] shadow-[0_0_18px_rgb(98_172_250/0.3)]">
                  <Icon className="size-4" aria-hidden />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-white sm:text-[19px]">{title}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-[var(--color-muted)]">
                    {description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
