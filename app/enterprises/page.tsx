import { EnterpriseHero } from "@/components/hero/EnterpriseHero";
import { EnterpriseExplorer } from "@/components/interactive/EnterpriseExplorer";
import { AudiencePage } from "@/components/sections/AudiencePage";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Reveal } from "@/components/ui/Reveal";
import { getAudience } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata("enterprises");

const audience = getAudience("enterprises");

export default function EnterprisesPage() {
  return (
    <AudiencePage
      id="enterprises"
      hero={
        <EnterpriseHero
          eyebrow={audience.eyebrow}
          headline={audience.headline}
          accentWord={audience.accentWord}
          description={audience.summary}
          primaryCta={audience.primaryCta}
          secondaryCta={audience.secondaryCta}
        />
      }
      uniqueSections={
        <>
          <section className="sp-section bg-[linear-gradient(#090d33,#0b0a33)]">
            <div className="sp-container">
              <Reveal>
                <p className="sp-eyebrow">Two admin roles</p>
                <h2 className="sp-heading mt-4 max-w-3xl text-[clamp(28px,3.5vw,44px)]">
                  Govern trust at scale — without mixing scopes
                </h2>
                <p className="sp-lede mt-4 max-w-2xl">
                  Super Admin governs the whole platform. Organization Admin runs one
                  tenant — members, modules, and scoped roles — without platform-wide powers.
                </p>
              </Reveal>
            </div>
          </section>

          <section id="demo" className="sp-section bg-[#0b0a33]">
            <div className="sp-container">
              <Reveal className="mb-8 max-w-3xl">
                <p className="sp-eyebrow">Interactive explorer</p>
                <h2 className="sp-heading mt-4 text-[clamp(28px,3.5vw,44px)]">
                  Platform governance & organization administration
                </h2>
              </Reveal>
              <EnterpriseExplorer />
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/trust/">
                  Trust & Security <span aria-hidden>→</span>
                </ButtonLink>
                <ButtonLink href="/contact/" variant="ghost">
                  Contact us <span aria-hidden>→</span>
                </ButtonLink>
              </div>
            </div>
          </section>
        </>
      }
    />
  );
}
