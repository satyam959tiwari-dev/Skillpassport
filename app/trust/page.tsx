import { TrustHero } from "@/components/hero/TrustHero";
import { TrustExplorer } from "@/components/interactive/TrustExplorer";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { trustPrinciples } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata("trust");

export default function TrustPage() {
  return (
    <>
      <TrustHero />

      <section id="framework" className="sp-section scroll-mt-24 bg-[#090d33]">
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
              Verification, approvals, permissions, and audit
            </h2>
          </Reveal>
          <TrustExplorer />
        </div>
      </section>

      <section className="sp-section bg-[linear-gradient(#0b0a33,#120f47)]">
        <div className="sp-container grid gap-8 lg:grid-cols-2">
          <Reveal className="sp-panel p-6">
            <h3 className="text-xl font-medium text-white">People make the trust decisions</h3>
            <p className="mt-3 text-[var(--color-muted)] leading-relaxed">
              Verifiers check credentials, reviewers grade the work, and admins approve
              sensitive outcomes. AI only drafts — and Audit Logs keep a record of operator actions.
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
