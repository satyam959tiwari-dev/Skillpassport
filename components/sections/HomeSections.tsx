import Link from "next/link";
import { SkillNetwork } from "@/components/animation/SkillNetwork";
import { FaqAccordion } from "@/components/interactive/FaqAccordion";
import { HowItWorks } from "@/components/interactive/HowItWorks";
import { SolutionsExplorer } from "@/components/interactive/SolutionsExplorer";
import { BelowBand } from "@/components/sections/BelowBand";
import { HomeAiSection } from "@/components/sections/HomeAiSection";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Reveal } from "@/components/ui/Reveal";
import {
  aiCapabilities,
  aiCorePrinciple,
  appLinks,
  ecosystemAudiences,
  ecosystemConnections,
  platformStatistics,
  problemPoints,
  productExperiences,
  statisticsDisclaimer,
  trustPrinciples,
  valuePillars,
} from "@/lib/content";

export function HomeSections() {
  return (
    <>
      <BelowBand>
        <small>CORE POSITIONING</small>
        <h2>The trust layer for skills and careers.</h2>
        <p>
          SkillPassport is the trust layer connecting skills, credentials, people,
          organizations, assessments, and opportunities — more than a job board or digital
          résumé.
        </p>
      </BelowBand>

      <section id="platform" className="sp-section bg-[linear-gradient(#120f47,#090d33)]">
        <div className="sp-container">
          <Reveal>
            <p className="sp-eyebrow">Why SkillPassport</p>
            <h2 className="sp-heading mt-4 max-w-3xl text-[clamp(32px,4vw,52px)]">
              The problem isn&apos;t talent. It&apos;s unverified claims.
            </h2>
            <p className="sp-lede mt-4 max-w-2xl">
              A résumé lists skills. A job board lists openings. SkillPassport connects
              skills, credentials, assessments, expert reviews, verification, organizations,
              people, and opportunities in one verification-first trust layer.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {problemPoints.map((point) => (
              <Reveal key={point.title} className="sp-panel p-6">
                <h3 className="text-xl font-medium text-white">{point.title}</h3>
                <p className="mt-3 text-[var(--color-muted)] leading-relaxed">
                  {point.description}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="sp-section bg-[#090d33]">
        <div className="sp-container">
          <Reveal>
            <p className="sp-eyebrow">Trust ecosystem</p>
            <h2 className="sp-heading mt-4 max-w-3xl text-[clamp(32px,4vw,52px)]">
              One trusted ecosystem. Built for every step of the journey.
            </h2>
            <p className="sp-lede mt-4 max-w-2xl">
              Multi-party by design: every audience has a place, and every trust signal
              stays connected — Skills, Credentials, Assessments, and more.
            </p>
          </Reveal>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Reveal>
              <p className="text-xs tracking-[0.14em] text-[var(--color-faint)] uppercase">
                Who uses SkillPassport
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {ecosystemAudiences.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="inline-flex rounded-full border border-[var(--color-rule)] px-3 py-1.5 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-sky)] hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal>
              <p className="text-xs tracking-[0.14em] text-[var(--color-faint)] uppercase">
                What SkillPassport connects
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {ecosystemConnections.map((label) => (
                  <li
                    key={label}
                    className="rounded-full border border-[var(--color-violet-line)]/50 bg-white/[0.04] px-3 py-1.5 text-sm text-white"
                  >
                    {label}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <div className="mt-10">
            <SkillNetwork />
          </div>
        </div>
      </section>

      <section className="sp-section bg-[linear-gradient(#090d33,#0b0a33)]">
        <div className="sp-container">
          <Reveal>
            <p className="sp-eyebrow">Core value</p>
            <h2 className="sp-heading mt-4 max-w-3xl text-[clamp(32px,4vw,52px)]">
              Verify credentials. Prove skills. Hire with trust.
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {valuePillars.map((pillar, i) => (
              <Reveal
                key={pillar.id}
                className="sp-panel relative overflow-hidden p-7"
              >
                <span className="text-sm tracking-[0.16em] text-[var(--color-sky)]">
                  0{i + 1}
                </span>
                <h3 className="mt-4 text-2xl font-medium text-white">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-[var(--color-muted)] leading-relaxed">
                  {pillar.description}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="sp-section bg-[#0b0a33]">
        <div className="sp-container">
          <Reveal>
            <p className="sp-eyebrow">Interactive journey</p>
            <h2 className="sp-heading mt-4 max-w-3xl text-[clamp(32px,4vw,52px)]">
              How SkillPassport works
            </h2>
            <p className="sp-lede mt-4 max-w-2xl">
              Build → Verify → Prove → Connect → Review → Govern → Stay Connected. A
              conceptual story of the ecosystem — not a mandatory click path.
            </p>
          </Reveal>
          <div className="mt-10">
            <HowItWorks />
          </div>
        </div>
      </section>

      <section className="sp-section bg-[linear-gradient(#0b0a33,#120f47)]">
        <div className="sp-container">
          <Reveal>
            <p className="sp-eyebrow">Solutions by audience</p>
            <h2 className="sp-heading mt-4 max-w-3xl text-[clamp(32px,4vw,52px)]">
              Built for every role in the ecosystem
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

      <section className="sp-section bg-[#120f47]">
        <div className="sp-container">
          <Reveal>
            <p className="sp-eyebrow">AI capabilities</p>
            <h2 className="sp-heading mt-4 max-w-3xl text-[clamp(32px,4vw,52px)]">
              AI that accelerates trust. Humans who remain in control.
            </h2>
            <p className="sp-lede mt-4 max-w-2xl">{aiCorePrinciple}</p>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {aiCapabilities.map((item) => (
              <Reveal key={item.id} className="sp-panel p-5">
                <p className="text-xs tracking-[0.14em] text-[var(--color-sky)] uppercase">
                  {item.owner}
                </p>
                <h3 className="mt-2 text-lg font-medium text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/90">{item.message}</p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                  {item.description}
                </p>
              </Reveal>
            ))}
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

      <section className="sp-section bg-[linear-gradient(#120f47,#090d33)]">
        <div className="sp-container">
          <Reveal>
            <p className="sp-eyebrow">Verification & governance</p>
            <h2 className="sp-heading mt-4 max-w-3xl text-[clamp(32px,4vw,52px)]">
              Trust isn&apos;t a feature. It&apos;s the foundation.
            </h2>
            <p className="sp-lede mt-4 max-w-2xl">
              Trust is governed, not simply generated — approvals, permissions, and audit keep
              outcomes accountable.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {trustPrinciples.map((item) => (
              <Reveal key={item.id} className="sp-panel p-6">
                <h3 className="text-xl font-medium text-white">{item.title}</h3>
                <p className="mt-3 text-[var(--color-muted)] leading-relaxed">
                  {item.description}
                </p>
              </Reveal>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/trust/" className="sp-btn-ghost">
              Read about trust &amp; security
            </Link>
          </div>
        </div>
      </section>

      <section className="sp-section bg-[#090d33]">
        <div className="sp-container">
          <Reveal>
            <p className="sp-eyebrow">Scale context</p>
            <h2 className="sp-heading mt-4 max-w-3xl text-[clamp(32px,4vw,52px)]">
              Built for a connected talent ecosystem
            </h2>
            <p className="sp-lede mt-4 max-w-2xl">{statisticsDisclaimer}</p>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {platformStatistics.map((stat) => (
              <Reveal key={stat.id} className="sp-panel p-6 text-center sm:text-left">
                <p className="text-3xl font-medium text-white sm:text-4xl">{stat.value}</p>
                <p className="mt-2 text-sm text-[var(--color-muted)]">{stat.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="sp-section bg-[linear-gradient(#090d33,#0b0a33)]">
        <div className="sp-container">
          <Reveal>
            <p className="sp-eyebrow">Illustrative product experiences</p>
            <h2 className="sp-heading mt-4 max-w-3xl text-[clamp(32px,4vw,52px)]">
              How the product can feel in context
            </h2>
            <p className="sp-lede mt-4 max-w-2xl">
              Marketing previews only — open each role demo for interactive walkthroughs.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {productExperiences.map((exp) => (
              <Reveal key={exp.id} className="sp-panel overflow-hidden">
                <div className="border-b border-[var(--color-rule)] bg-black/25 px-5 py-4">
                  <div className="flex gap-2" aria-hidden>
                    <span className="size-2.5 rounded-full bg-white/20" />
                    <span className="size-2.5 rounded-full bg-white/20" />
                    <span className="size-2.5 rounded-full bg-white/20" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-white">{exp.title}</h3>
                  <p className="mt-2 text-sm text-[var(--color-muted)] leading-relaxed">
                    {exp.description}
                  </p>
                  <ul className="mt-5 space-y-2">
                    {exp.panels.map((panel) => (
                      <li
                        key={panel}
                        className="rounded-lg bg-white/[0.04] px-3 py-2 text-sm text-[var(--color-faint)]"
                      >
                        {panel}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={exp.href}
                    className="mt-5 inline-flex text-sm text-[var(--color-sky)] hover:underline"
                  >
                    Open related demo
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="sp-section bg-[linear-gradient(#0b0a33,#090d33)]">
        <div className="sp-container">
          <Reveal className="text-center">
            <p className="sp-eyebrow justify-center">FAQ</p>
            <h2 className="sp-heading mt-4 text-[clamp(32px,4vw,52px)]">
              Questions, answered clearly
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
              Your skills deserve more than a résumé. They deserve trust.
            </h2>
            <p className="sp-lede mx-auto mt-4 max-w-xl">
              Create an illustrative passport demo, or talk with us about the SkillPassport
              trust ecosystem.
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
