import type { ReactNode } from "react";
import { PageHero } from "@/components/hero/PageHero";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Reveal } from "@/components/ui/Reveal";
import { getAudience, howItWorks, trustPrinciples } from "@/lib/content";
import { accentHeadline } from "@/lib/title";
import type { AudienceId } from "@/types";

type Props = {
  id: AudienceId;
  uniqueSections: ReactNode;
  /** Optional custom hero that replaces the default PageHero */
  hero?: ReactNode;
};

export function AudiencePage({ id, uniqueSections, hero }: Props) {
  const audience = getAudience(id);

  return (
    <>
      {hero ?? (
      <PageHero
        eyebrow={audience.eyebrow}
        title={accentHeadline(audience.headline, audience.accentWord)}
        description={audience.summary}
        primaryCta={audience.primaryCta}
        secondaryCta={audience.secondaryCta}
        visual={id}
      />
      )}

      <section className="sp-section bg-[#090d33]">
        <div className="sp-container grid gap-8 lg:grid-cols-2">
          <Reveal>
            <p className="sp-eyebrow">Why it matters</p>
            <h2 className="sp-heading mt-4 text-[clamp(28px,3.5vw,44px)]">
              Benefits designed for {audience.title.toLowerCase()}
            </h2>
            <ul className="mt-6 space-y-3">
              {audience.benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="rounded-xl border border-[var(--color-rule)] bg-white/[0.03] px-4 py-3 text-[var(--color-muted)]"
                >
                  {benefit}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal className="sp-panel p-6 sm:p-8">
            <h3 className="text-sm font-medium tracking-[0.14em] text-[#bdb4ff]">
              CAPABILITIES
            </h3>
            <ul className="mt-5 space-y-4">
              {audience.features.map((feature, i) => (
                <li key={feature} className="flex gap-4">
                  <span className="text-[var(--color-sky)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-white">{feature}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <div id="journey">{uniqueSections}</div>

      <section className="sp-section bg-[#0b0a33]">
        <div className="sp-container">
          <Reveal>
            <p className="sp-eyebrow">Where you fit in the journey</p>
            <h2 className="sp-heading mt-4 max-w-3xl text-[clamp(28px,3.5vw,44px)]">
              Connected to the full trust workflow
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {howItWorks.map((stage) => (
              <Reveal key={stage.id} className="sp-panel p-5">
                <span className="text-sm text-[var(--color-sky)]">{stage.label}</span>
                <h3 className="mt-2 text-lg font-medium text-white">{stage.title}</h3>
                <p className="mt-2 text-sm text-[var(--color-muted)] leading-relaxed">
                  {stage.description}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="sp-section bg-[linear-gradient(#0b0a33,#120f47)]">
        <div className="sp-container grid gap-6 lg:grid-cols-2">
          {trustPrinciples.slice(0, 2).map((item) => (
            <Reveal key={item.id} className="sp-panel p-6">
              <h3 className="text-xl font-medium text-white">{item.title}</h3>
              <p className="mt-3 text-[var(--color-muted)] leading-relaxed">
                {item.description}
              </p>
            </Reveal>
          ))}
        </div>
        <div className="sp-container mt-10 text-center">
          <ButtonLink href={audience.footerCta.href}>
            {audience.footerCta.label}
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
