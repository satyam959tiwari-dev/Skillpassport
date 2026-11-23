import { ReviewerHero } from "@/components/hero/ReviewerHero";
import { ReviewerExperience } from "@/components/interactive/ReviewerExperience";
import { AudiencePage } from "@/components/sections/AudiencePage";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Reveal } from "@/components/ui/Reveal";
import { getAudience } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata("reviewers");

const audience = getAudience("reviewers");

export default function ReviewersPage() {
  return (
    <AudiencePage
      id="reviewers"
      hero={
        <ReviewerHero
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
                <p className="sp-eyebrow">Why expert review</p>
                <h2 className="sp-heading mt-4 max-w-3xl text-[clamp(28px,3.5vw,44px)]">
                  Evaluate skills with confidence
                </h2>
                <p className="sp-lede mt-4 max-w-2xl">
                  Turn expertise into structured assessment — rubrics, checklists, rich media
                  review, and AI-assisted form import with human refinement.
                </p>
              </Reveal>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <Reveal className="sp-panel p-5">
                  <h3 className="font-medium text-white">Manual path</h3>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    Create rubric or checklist in the forms library / manual builder.
                  </p>
                </Reveal>
                <Reveal className="sp-panel p-5">
                  <h3 className="font-medium text-white">AI-assisted path</h3>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    Import document → classify → draft → refine in AI Form Builder → preview /
                    draft / publish. AI Form Builder is a visual editor, not a chat.
                  </p>
                </Reveal>
              </div>
            </div>
          </section>

          <section id="demo" className="sp-section bg-[#0b0a33]">
            <div className="sp-container">
              <Reveal className="mb-8 max-w-3xl">
                <p className="sp-eyebrow">Try it</p>
                <h2 className="sp-heading mt-4 text-[clamp(28px,3.5vw,44px)]">
                  Queues, scoring, and AI form refinement
                </h2>
              </Reveal>
              <ReviewerExperience />
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/ai/">
                  AI form import capabilities <span aria-hidden>→</span>
                </ButtonLink>
                <ButtonLink href="/employers/" variant="ghost">
                  Company reviewer context <span aria-hidden>→</span>
                </ButtonLink>
              </div>
            </div>
          </section>

          <section className="sp-section bg-[#090d33]">
            <div className="sp-container">
              <Reveal className="mb-8 max-w-3xl">
                <p className="sp-eyebrow">Also in the workspace</p>
                <h2 className="sp-heading mt-4 text-[clamp(24px,2.6vw,34px)]">Queues, forms and reporting</h2>
              </Reveal>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[
                "Assessment / Media queues · My Reviews · Reporting",
                "Forms library · form preview · grading summary",
                "PDF annotation · video review · document workflows",
                "Good Practices · Guidelines · Help Center (curated, not generative AI)",
                "Review results go to admin approval where required",
                "Company reviewers also appear under Employers",
              ].map((item) => (
                <Reveal key={item} className="sp-panel p-5">
                  <p className="text-sm text-[var(--color-muted)]">{item}</p>
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
