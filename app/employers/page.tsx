import { EmployerHero } from "@/components/hero/EmployerHero";
import { EmployerExperience } from "@/components/interactive/EmployerExperience";
import { AudiencePage } from "@/components/sections/AudiencePage";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Reveal } from "@/components/ui/Reveal";
import { getAudience } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata("employers");

const audience = getAudience("employers");

export default function EmployersPage() {
  return (
    <AudiencePage
      id="employers"
      hero={
        <EmployerHero
          eyebrow={audience.eyebrow}
          primaryCta={audience.primaryCta}
          secondaryCta={audience.secondaryCta}
        />
      }
      uniqueSections={
        <>
          <section className="sp-section bg-[linear-gradient(#090d33,#0b0a33)]">
            <div className="sp-container">
              <Reveal>
                <p className="sp-eyebrow">Hiring challenges</p>
                <h2 className="sp-heading mt-4 max-w-3xl text-[clamp(28px,3.5vw,44px)]">
                  Evidence over guesswork
                </h2>
                <p className="sp-lede mt-4 max-w-2xl">
                  Discover talent supported by skills, credentials, and assessment evidence —
                  then run jobs, applicants, interviews, and reporting in one workflow.
                </p>
              </Reveal>
            </div>
          </section>

          <section id="demo" className="sp-section bg-[#0b0a33]">
            <div className="sp-container">
              <Reveal className="mb-8 max-w-3xl">
                <p className="sp-eyebrow">Try it</p>
                <h2 className="sp-heading mt-4 text-[clamp(28px,3.5vw,44px)]">
                  Explore the employer workspace
                </h2>
              </Reveal>
              <EmployerExperience />
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/contact/">
                  Contact our team <span aria-hidden>→</span>
                </ButtonLink>
                <ButtonLink href="/candidates/" variant="ghost">
                  See candidate evidence <span aria-hidden>→</span>
                </ButtonLink>
              </div>
            </div>
          </section>

          <section className="sp-section bg-[#090d33]">
            <div className="sp-container">
              <Reveal className="mb-8 max-w-3xl">
                <p className="sp-eyebrow">Also in the workspace</p>
                <h2 className="sp-heading mt-4 text-[clamp(24px,2.6vw,34px)]">Everything your hiring team works with</h2>
              </Reveal>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[
                "Talent Search with skill-focused filters",
                "Jobs: create/edit, screening, skills, locations, publish",
                "Company hiring assessments",
                "Applicants pipeline management",
                "Interviews: schedule, reschedule, cancel, evaluate",
                "Company Profile & Team Management seats",
                "Company reviewer Assessment queue & My Reviews",
                "Reporting: team skill performance & gaps",
                "Good Practice AI Query under Reporting",
              ].map((item) => (
                <Reveal key={item} className="sp-panel p-5">
                  <p className="text-sm leading-relaxed text-[var(--color-muted)]">{item}</p>
                </Reveal>
              ))}
            </div>
            </div>
          </section>
        </>
      }
    />
  );
}
