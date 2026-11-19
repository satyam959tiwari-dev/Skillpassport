import { PageHero } from "@/components/hero/PageHero";
import { TrustExplorer } from "@/components/interactive/TrustExplorer";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { trustPrinciples } from "@/lib/content";
import { accentHeadline } from "@/lib/title";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata("trust");

export default function TrustPage() {
  return (
    <>
      <PageHero
        eyebrow="Trust & security"
        title={accentHeadline(
          "Trust isn't a feature. It's the foundation.",
          "foundation",
        )}
        description="Verify once. Be trusted everywhere. SkillPassport emphasizes reusable verification, structured expert grading, rich review workflows, governance, permissions, referrals, support, and realtime collaboration in the product app — explained here without unsupported claims."
        primaryCta={{ label: "Explore differentiators", href: "#demo" }}
        secondaryCta={{ label: "Contact us", href: "/contact/" }}
        visual="trust"
      />

      <section className="sp-section bg-[#090d33]">
        <div className="sp-container grid gap-5 md:grid-cols-2">
          {trustPrinciples.map((item) => (
            <Reveal key={item.id} className="sp-panel p-6 sm:p-8">
              <h2 className="text-2xl font-medium text-white">{item.title}</h2>
              <p className="mt-3 text-[var(--color-muted)] leading-relaxed">
                {item.description}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="demo" className="sp-section bg-[#0b0a33]">
        <div className="sp-container">
          <Reveal className="mb-8 max-w-3xl">
            <p className="sp-eyebrow">Interactive explorer</p>
            <h2 className="sp-heading mt-4 text-[clamp(28px,3.5vw,44px)]">
              Evidence, approvals, permissions, and support context
            </h2>
          </Reveal>
          <TrustExplorer />
        </div>
      </section>

      <section className="sp-section bg-[linear-gradient(#0b0a33,#120f47)]">
        <div className="sp-container grid gap-8 lg:grid-cols-2">
          <Reveal className="sp-panel p-6">
            <h3 className="text-xl font-medium text-white">What this page does not claim</h3>
            <p className="mt-3 text-[var(--color-muted)] leading-relaxed">
              No invented certifications, compliance badges, customer counts, or live
              verification. Realtime updates and approvals belong to the existing
              application — explained here as concepts.
            </p>
          </Reveal>
          <Reveal className="sp-panel p-6">
            <h3 className="text-xl font-medium text-white">Continue exploring</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              <ButtonLink href="/enterprises/">Enterprises</ButtonLink>
              <ButtonLink href="/verifiers/" variant="ghost">
                Verifiers
              </ButtonLink>
              <ButtonLink href="/reviewers/" variant="ghost">
                Reviewers
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
