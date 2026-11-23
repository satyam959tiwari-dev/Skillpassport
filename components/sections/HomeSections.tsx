import Link from "next/link";
import {
  Award,
  Briefcase,
  Building2,
  Check,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  FileText,
  Layers,
  Network,
  Shield,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserRound,
  Users,
} from "lucide-react";
import { FaqAccordion } from "@/components/interactive/FaqAccordion";
import { HowItWorks } from "@/components/interactive/HowItWorks";
import { SolutionsExplorer } from "@/components/interactive/SolutionsExplorer";
import { CorePositioning } from "@/components/sections/CorePositioning";
import { HomeAiSection } from "@/components/sections/HomeAiSection";
import { TrustEcosystem } from "@/components/sections/TrustEcosystem";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Reveal } from "@/components/ui/Reveal";
import {
  aiCapabilities,
  aiCorePrinciple,
  appLinks,
  platformStatistics,
  problemPoints,
  productExperiences,
  statisticsDisclaimer,
  trustPrinciples,
  valuePillars,
} from "@/lib/content";

const problemIcons = [FileText, Layers, Shield] as const;
const valueIcons = [ShieldCheck, Layers, Briefcase] as const;
const valueGlow = [
  "shadow-[0_12px_40px_rgb(106_70_232/0.25)] border-[rgb(106_70_232/0.35)]",
  "shadow-[0_12px_48px_rgb(98_172_250/0.35)] border-[rgb(98_172_250/0.55)]",
  "shadow-[0_12px_40px_rgb(106_70_232/0.25)] border-[rgb(106_70_232/0.35)]",
] as const;
const trustIcons = [ShieldCheck, UserCheck, ClipboardList, Network] as const;
const statIcons = [Users, ShieldCheck, ClipboardCheck, UserCheck] as const;
const productIcons = [UserRound, Briefcase, ShieldCheck] as const;
const aiIcons = [Sparkles, Layers, FileText, ClipboardCheck, Award, Layers] as const;

export function HomeSections() {
  return (
    <>
      <CorePositioning />

      {/* Why SkillPassport — bottom of 04_12_13 */}
      <section
        id="platform"
        className="sp-section relative overflow-hidden bg-[linear-gradient(#120f47,#090d33)]"
      >
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(40% 35% at 85% 15%, rgb(98 172 250 / 0.12), transparent 60%)",
          }}
        />
        <div className="sp-container relative">
          <Reveal>
            <p className="sp-eyebrow">Why SkillPassport</p>
            <h2 className="sp-heading mt-4 max-w-3xl text-[clamp(32px,4vw,52px)]">
              The problem isn&apos;t talent. It&apos;s{" "}
              <span className="sp-gradient-text">unverified claims.</span>
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {problemPoints.map((point, i) => {
              const Icon = problemIcons[i] ?? Layers;
              return (
                <Reveal
                  key={point.title}
                  className="rounded-[18px] border border-[rgb(98_172_250/0.22)] bg-[linear-gradient(165deg,rgb(18_22_70/0.78),rgb(9_13_51/0.7))] p-5 shadow-[0_16px_40px_rgb(0_0_0/0.28),inset_0_1px_0_rgb(255_255_255/0.06)] backdrop-blur-xl"
                >
                  <span className="inline-flex size-11 items-center justify-center rounded-xl border border-[rgb(98_172_250/0.35)] bg-[linear-gradient(160deg,rgb(98_172_250/0.3),rgb(16_113_250/0.1))] text-[var(--color-sky)] shadow-[0_0_20px_rgb(98_172_250/0.3)]">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-lg font-medium text-white sm:text-xl">{point.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-muted)]">
                    {point.description}
                  </p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <TrustEcosystem />

      {/* Core value — Verify Skills, Hire with Trust.png */}
      <section className="sp-section relative overflow-hidden bg-[linear-gradient(#090d33,#0b0a33)]">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(35% 30% at 10% 80%, rgb(106 70 232 / 0.16), transparent 60%), radial-gradient(30% 28% at 90% 20%, rgb(98 172 250 / 0.12), transparent 55%)",
          }}
        />
        <div className="sp-container relative">
          <Reveal>
            <p className="sp-eyebrow">Core value</p>
            <h2 className="sp-heading mt-4 max-w-3xl text-[clamp(32px,4vw,52px)]">
              Verify credentials. Prove skills.{" "}
              <span className="sp-gradient-text">Hire with trust.</span>
            </h2>
            <p className="sp-lede mt-4 max-w-2xl">
              One verified profile, skills proven with structured reviews, and hiring that
              runs on evidence — for every role in the trust workflow.
            </p>
          </Reveal>
          <div className="mt-8 grid gap-3 lg:grid-cols-3 lg:gap-3.5">
            {valuePillars.map((pillar, i) => {
              const Icon = valueIcons[i] ?? ShieldCheck;
              return (
                <Reveal key={pillar.id} className="relative">
                  {i < valuePillars.length - 1 && (
                    <span
                      className="pointer-events-none absolute top-1/2 right-[-12px] z-10 hidden size-7 -translate-y-1/2 items-center justify-center rounded-full border border-[rgb(106_70_232/0.45)] bg-[var(--color-ink)] text-[var(--color-sky)] shadow-[0_0_14px_rgb(106_70_232/0.35)] lg:flex"
                      aria-hidden
                    >
                      <ChevronRight className="size-3.5" />
                    </span>
                  )}
                  <div
                    className={`h-full rounded-[18px] border bg-[linear-gradient(165deg,rgb(18_22_70/0.85),rgb(9_13_51/0.75))] p-5 backdrop-blur-xl sm:p-6 ${valueGlow[i]}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`inline-flex size-12 items-center justify-center rounded-2xl border text-white ${
                          i === 1
                            ? "border-[rgb(98_172_250/0.5)] bg-[linear-gradient(160deg,#62acfa,#3387f2)] shadow-[0_0_24px_rgb(98_172_250/0.45)]"
                            : "border-[rgb(106_70_232/0.45)] bg-[linear-gradient(160deg,#6a46e8,#441eb6)] shadow-[0_0_24px_rgb(106_70_232/0.4)]"
                        }`}
                      >
                        <Icon className="size-5" aria-hidden />
                      </span>
                      <span
                        className={`text-sm tracking-[0.16em] ${
                          i === 1 ? "text-[var(--color-sky)]" : "text-[#bdb4ff]"
                        }`}
                      >
                        0{i + 1}
                      </span>
                    </div>
                    <h3 className="mt-4 text-xl font-medium text-white sm:text-[22px]">{pillar.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-muted)]">
                      {pillar.description}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="sp-section relative overflow-hidden bg-[#0b0a33]">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(40% 35% at 90% 10%, rgb(106 70 232 / 0.16), transparent 55%)",
          }}
        />
        <div className="sp-container relative">
          <Reveal>
            <p className="sp-eyebrow">End-to-end story</p>
            <h2 className="sp-heading mt-4 max-w-3xl text-[clamp(32px,4vw,52px)]">
              How SkillPassport <span className="sp-gradient-text">works</span>
            </h2>
            <p className="sp-lede mt-4 max-w-2xl">
              Seven steps, each owned by one role — from a candidate&apos;s profile to
              admin-approved results. Select a step to see who does what.
            </p>
          </Reveal>
          <div className="mt-10">
            <HowItWorks />
          </div>
        </div>
      </section>

      <section className="sp-section relative overflow-hidden bg-[linear-gradient(#0b0a33,#120f47)]">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(35% 30% at 10% 20%, rgb(98 172 250 / 0.12), transparent 55%)",
          }}
        />
        <div className="sp-container relative">
          <Reveal>
            <p className="sp-eyebrow">Solutions by audience</p>
            <h2 className="sp-heading mt-4 max-w-3xl text-[clamp(32px,4vw,52px)]">
              Built for every role in the{" "}
              <span className="sp-gradient-text">ecosystem</span>
            </h2>
            <p className="sp-lede mt-4 max-w-2xl">
              Candidates, Employers, Verifiers, Reviewers, Super Admin, and Organization
              Admin — Enterprises keeps Super Admin and Organization Admin clearly
              separated.
            </p>
          </Reveal>
          <div className="mt-10">
            <SolutionsExplorer />
          </div>
        </div>
      </section>

      <section className="sp-section relative overflow-hidden bg-[#120f47]">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(40% 35% at 90% 0%, rgb(106 70 232 / 0.22), transparent 55%)",
          }}
        />
        <div className="sp-container relative">
          <Reveal>
            <p className="sp-eyebrow">AI capabilities</p>
            <h2 className="sp-heading mt-4 max-w-3xl text-[clamp(32px,4vw,52px)]">
              AI that accelerates <span className="sp-gradient-text">trust</span>. Humans who{" "}
              <span className="sp-gradient-text">remain in control</span>.
            </h2>
            <p className="sp-lede mt-4 max-w-2xl">{aiCorePrinciple}</p>
          </Reveal>
          <div className="mt-8 grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
            {aiCapabilities.map((item, i) => {
              const Icon = aiIcons[i] ?? Sparkles;
              return (
                <Reveal
                  key={item.id}
                  className={`flex flex-col rounded-[20px] border bg-[linear-gradient(165deg,rgb(22_26_78/0.92),rgb(9_13_51/0.88))] p-5 backdrop-blur-xl sm:p-6 ${
                    i === 0
                      ? "border-[rgb(106_70_232/0.55)] shadow-[0_0_28px_rgb(106_70_232/0.25)]"
                      : "border-[rgb(98_172_250/0.18)] shadow-[inset_0_1px_0_rgb(255_255_255/0.05)]"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-[rgb(167_139_250/0.4)] bg-[linear-gradient(160deg,rgb(106_70_232/0.4),rgb(16_113_250/0.14))] text-[#d4c4ff] shadow-[0_0_20px_rgb(106_70_232/0.35)]">
                      <Icon className="size-[18px]" aria-hidden />
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <span className="inline-flex rounded-full border border-[rgb(167_139_250/0.35)] bg-[rgb(106_70_232/0.18)] px-2.5 py-0.5 text-[11px] font-medium tracking-[0.14em] text-[#d4c4ff] uppercase">
                        {item.owner}
                      </span>
                      <h3 className="mt-2 text-[17px] font-semibold leading-snug tracking-[-0.01em] text-white sm:text-[18px]">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  <p className="mt-4 text-[15px] leading-[1.65] font-medium text-[rgb(226_234_255/0.95)] sm:text-[16px]">
                    {item.message}
                  </p>

                  <div className="mt-4 border-t border-[rgb(98_172_250/0.12)] pt-3.5">
                    <p className="text-[13px] leading-[1.7] text-[rgb(168_184_220/0.92)] sm:text-[14px]">
                      {item.description}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
          <div className="mt-10">
            <HomeAiSection />
          </div>
          <div className="mt-8">
            <ButtonLink href="/ai/" variant="ghost">
              Explore AI on SkillPassport
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Verification & governance — Neon Trust and Governance Dashboard.png */}
      <section className="sp-section relative overflow-hidden bg-[linear-gradient(#120f47,#090d33)]">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(45% 40% at 85% 15%, rgb(106 70 232 / 0.2), transparent 55%), radial-gradient(30% 28% at 10% 85%, rgb(98 172 250 / 0.12), transparent 55%)",
          }}
        />
        <div className="sp-container relative">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-8">
            <Reveal>
              <p className="sp-eyebrow">Verification &amp; governance</p>
              <h2 className="sp-heading mt-4 max-w-3xl text-[clamp(32px,4vw,52px)]">
                Trust isn&apos;t a feature. It&apos;s the{" "}
                <span className="sp-gradient-text">foundation.</span>
              </h2>
              <p className="sp-lede mt-4 max-w-2xl">
                Trust is governed, not simply generated — approvals, permissions, and audit
                keep outcomes accountable.
              </p>
            </Reveal>

            {/*
              Governance visual knobs:
              - Shield center: left-[32%] / top-1/2  |  diameter: width 34%  → SVG cx=32 cy=50 r=17
              - Soft blue glassy spokes touch shield OUTER rim only (mask cuts interior)
              - No adjacent/concentric rings — shield alone
            */}
            <Reveal className="relative mx-auto aspect-[5/4] w-full max-w-md overflow-visible rounded-[20px] border border-[rgb(98_172_250/0.16)] bg-[linear-gradient(165deg,rgb(18_22_70/0.45),transparent)] p-4">
              <div
                className="pointer-events-none absolute inset-0 rounded-[20px]"
                style={{
                  background:
                    "radial-gradient(circle at 32% 50%, rgb(98 172 250 / 0.28), rgb(106 70 232 / 0.1), transparent 58%)",
                }}
                aria-hidden
              />

              <svg
                className="pointer-events-none absolute inset-0 z-[5] size-full overflow-visible"
                viewBox="0 0 100 100"
                aria-hidden
              >
                <defs>
                  {/* Hide anything inside the shield so lines only touch its outer boundary */}
                  <mask id="gov-spoke-mask">
                    <rect x="0" y="0" width="100" height="100" fill="white" />
                    <circle cx="32" cy="50" r="16.85" fill="black" />
                  </mask>
                </defs>

                <g mask="url(#gov-spoke-mask)">
                  {/* Soft glassy blue underlays */}
                  <line
                    x1="45.9"
                    y1="40.3"
                    x2="70"
                    y2="20"
                    stroke="#62acfa"
                    strokeWidth="1.8"
                    strokeOpacity="0.16"
                    strokeLinecap="round"
                  />
                  <line
                    x1="49.1"
                    y1="50"
                    x2="70"
                    y2="50"
                    stroke="#62acfa"
                    strokeWidth="2"
                    strokeOpacity="0.18"
                    strokeLinecap="round"
                  />
                  <line
                    x1="45.9"
                    y1="59.7"
                    x2="68"
                    y2="80"
                    stroke="#62acfa"
                    strokeWidth="1.8"
                    strokeOpacity="0.16"
                    strokeLinecap="round"
                  />
                  {/* Soft blue glassy main strokes — less solid */}
                  <line
                    x1="45.9"
                    y1="40.3"
                    x2="70"
                    y2="20"
                    stroke="#62acfa"
                    strokeWidth="0.5"
                    strokeOpacity="0.48"
                    strokeLinecap="round"
                  />
                  <line
                    x1="49.1"
                    y1="50"
                    x2="70"
                    y2="50"
                    stroke="#62acfa"
                    strokeWidth="0.55"
                    strokeOpacity="0.52"
                    strokeLinecap="round"
                  />
                  <line
                    x1="45.9"
                    y1="59.7"
                    x2="68"
                    y2="80"
                    stroke="#62acfa"
                    strokeWidth="0.5"
                    strokeOpacity="0.48"
                    strokeLinecap="round"
                  />
                  <circle cx="45.9" cy="40.3" r="0.8" fill="#62acfa" fillOpacity="0.65" />
                  <circle cx="49.1" cy="50" r="0.9" fill="#62acfa" fillOpacity="0.7" />
                  <circle cx="45.9" cy="59.7" r="0.8" fill="#62acfa" fillOpacity="0.65" />
                  <circle cx="70" cy="20" r="0.9" fill="#62acfa" fillOpacity="0.7" />
                  <circle cx="70" cy="50" r="1" fill="#62acfa" fillOpacity="0.75" />
                  <circle cx="68" cy="80" r="0.9" fill="#62acfa" fillOpacity="0.7" />
                </g>
              </svg>

              {/* Larger glass shield — no adjacent rings */}
              <div
                className="absolute top-1/2 left-[32%] z-10 flex aspect-square -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
                style={{
                  width: "34%",
                  background:
                    "radial-gradient(circle at 30% 26%, rgb(186 220 255 / 0.75), rgb(82 140 242 / 0.45) 42%, rgb(22 17 82 / 0.72) 100%)",
                  boxShadow:
                    "0 0 48px rgb(98 172 250 / 0.55), 0 0 20px rgb(106 70 232 / 0.35), inset 0 0 22px rgb(255 255 255 / 0.22)",
                  border: "1.5px solid rgb(168 212 255 / 0.55)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <ShieldCheck className="size-[42%] text-white drop-shadow-[0_0_10px_rgb(98_172_250/0.7)]" aria-hidden />
              </div>

              <span className="absolute top-[12%] right-[4%] z-20 inline-flex items-center gap-1.5 rounded-full border border-[rgb(98_172_250/0.55)] bg-[rgb(9_13_51/0.97)] px-3 py-1.5 text-xs font-medium text-white shadow-[0_0_18px_rgb(98_172_250/0.4)] backdrop-blur-md">
                <Check className="size-3.5 text-[var(--color-sky)]" aria-hidden />
                Approval
              </span>
              <span className="absolute top-[46%] right-[2%] z-20 inline-flex items-center gap-1.5 rounded-full border border-[rgb(98_172_250/0.55)] bg-[rgb(9_13_51/0.97)] px-3 py-1.5 text-xs font-medium text-white shadow-[0_0_18px_rgb(98_172_250/0.4)] backdrop-blur-md">
                <Layers className="size-3.5 text-[var(--color-sky)]" aria-hidden />
                Permissions
              </span>
              <span className="absolute bottom-[12%] right-[5%] z-20 inline-flex items-center gap-1.5 rounded-full border border-[rgb(98_172_250/0.55)] bg-[rgb(9_13_51/0.97)] px-3 py-1.5 text-xs font-medium text-white shadow-[0_0_18px_rgb(98_172_250/0.4)] backdrop-blur-md">
                <FileText className="size-3.5 text-[var(--color-sky)]" aria-hidden />
                Audit
              </span>
            </Reveal>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {trustPrinciples.map((item, i) => {
              const Icon = trustIcons[i] ?? ShieldCheck;
              return (
                <Reveal
                  key={item.id}
                  className={`flex items-center gap-3 rounded-[18px] border bg-[linear-gradient(165deg,rgb(18_22_70/0.85),rgb(9_13_51/0.75))] p-5 backdrop-blur-xl sm:p-6 ${
                    i === 0
                      ? "border-[rgb(106_70_232/0.55)] shadow-[0_0_28px_rgb(106_70_232/0.25)]"
                      : "border-[rgb(98_172_250/0.16)]"
                  }`}
                >
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-[rgb(98_172_250/0.3)] bg-[rgb(98_172_250/0.12)] text-[var(--color-sky)]">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-lg font-medium text-white sm:text-xl">{item.title}</h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-[var(--color-muted)] sm:text-base">
                      {item.description}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
          <div className="mt-8">
            <Link href="/trust/" className="sp-btn-primary inline-flex">
              Read about trust &amp; security
              <ChevronRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <section className="sp-section relative overflow-hidden bg-[#090d33]">
        <div className="sp-container relative">
          <Reveal>
            <p className="sp-eyebrow">Platform at a glance</p>
            <h2 className="sp-heading mt-4 max-w-3xl text-[clamp(32px,4vw,52px)]">
              Built for a connected{" "}
              <span className="sp-gradient-text">talent ecosystem</span>
            </h2>
            <p className="sp-lede mt-4 max-w-2xl">{statisticsDisclaimer}</p>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {platformStatistics.map((stat, i) => {
              const Icon = statIcons[i] ?? Users;
              return (
                <Reveal
                  key={stat.id}
                  className="rounded-[20px] border border-[rgb(98_172_250/0.18)] bg-[linear-gradient(165deg,rgb(18_22_70/0.8),rgb(9_13_51/0.7))] p-6 backdrop-blur-xl"
                >
                  <span className="sp-icon-tile">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-5 text-[19px] font-semibold leading-snug text-white">{stat.title}</h3>
                  <p className="mt-2 text-[15px] text-[var(--color-muted)]">{stat.label}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="sp-section relative overflow-hidden bg-[linear-gradient(#090d33,#0b0a33)]">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(35% 30% at 90% 10%, rgb(98 172 250 / 0.12), transparent 55%)",
          }}
        />
        <div className="sp-container relative">
          <Reveal>
            <p className="sp-eyebrow">Product experiences</p>
            <h2 className="sp-heading mt-4 max-w-3xl text-[clamp(32px,4vw,52px)]">
              How the product can feel{" "}
              <span className="sp-gradient-text">in context</span>
            </h2>
            <p className="sp-lede mt-4 max-w-2xl">
              A look at each role&apos;s workspace — open one to try it hands-on.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {productExperiences.map((exp, i) => {
              const Icon = productIcons[i] ?? UserRound;
              return (
                <Reveal
                  key={exp.id}
                  className="overflow-hidden rounded-[20px] border border-[rgb(98_172_250/0.2)] bg-[linear-gradient(165deg,rgb(18_22_70/0.85),rgb(9_13_51/0.75))] backdrop-blur-xl"
                >
                  <div className="border-b border-[var(--color-rule)] bg-inset-strong px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex gap-2" aria-hidden>
                        <span className="size-2.5 rounded-full bg-white/20" />
                        <span className="size-2.5 rounded-full bg-white/20" />
                        <span className="size-2.5 rounded-full bg-white/20" />
                      </div>
                      <span className="sp-icon-tile !size-9">
                        <Icon className="size-4" aria-hidden />
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-white sm:text-xl">{exp.title}</h3>
                    <p className="mt-2 text-[15px] text-[var(--color-muted)] leading-relaxed">
                      {exp.description}
                    </p>
                    <ul className="mt-5 space-y-2">
                      {exp.panels.map((panel) => (
                        <li
                          key={panel}
                          className="flex items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-2 text-sm text-[var(--color-faint)]"
                        >
                          <Check className="size-3.5 text-[var(--color-sky)]" aria-hidden />
                          {panel}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={exp.href}
                      className="mt-5 inline-flex items-center gap-1 text-sm text-[var(--color-sky)] hover:underline"
                    >
                      Try this workspace
                      <ChevronRight className="size-3.5" aria-hidden />
                    </Link>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="sp-section relative overflow-hidden bg-[linear-gradient(#0b0a33,#090d33)]">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(40% 35% at 80% 0%, rgb(106 70 232 / 0.16), transparent 55%)",
          }}
        />
        <div className="sp-container relative">
          <Reveal className="text-center">
            <p className="sp-eyebrow justify-center">FAQ</p>
            <h2 className="sp-heading mt-4 text-[clamp(32px,4vw,52px)]">
              Questions, answered{" "}
              <span className="sp-gradient-text">clearly</span>
            </h2>
          </Reveal>
          <div className="mt-10">
            <FaqAccordion />
          </div>
        </div>
      </section>

      <section className="sp-section bg-[radial-gradient(60%_80%_at_50%_0%,rgb(68_30_182/0.35),transparent_60%),#0b0a33]">
        <div className="sp-container text-center">
          <Reveal>
            <p className="sp-eyebrow justify-center">Get started</p>
            <h2 className="sp-heading mx-auto mt-4 max-w-3xl text-[clamp(32px,4vw,56px)]">
              Your skills deserve more than a resume. They deserve{" "}
              <span className="sp-gradient-text">trust.</span>
            </h2>
            <p className="sp-lede mx-auto mt-4 max-w-xl">
              Create your Skill Passport, or talk with our team about bringing
              SkillPassport to your organization.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <ButtonLink href={appLinks.register}>Get Started</ButtonLink>
              <ButtonLink href="/contact/" variant="ghost">
                Talk to Our Team
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
