import { VerifierBoard } from "@/components/interactive/VerifierBoard";
import { AudiencePage } from "@/components/sections/AudiencePage";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Reveal } from "@/components/ui/Reveal";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata("verifiers");

export default function VerifiersPage() {
  return (
    <AudiencePage
      id="verifiers"
      uniqueSections={
        <>
          <section className="sp-section bg-[linear-gradient(#090d33,#0b0a33)]">
            <div className="sp-container">
              <Reveal>
                <p className="sp-eyebrow">Why verification matters</p>
                <h2 className="sp-heading mt-4 max-w-3xl text-[clamp(28px,3.5vw,44px)]">
                  Make every credential count
                </h2>
                <p className="sp-lede mt-4 max-w-2xl">
                  Structured verification workflows with visibility and oversight. Queues and
                  statuses are documented separately — we do not invent a mandatory transition order.
                </p>
              </Reveal>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    title: "Apply Verification",
                    body: "Verification-related requests enter the workflow.",
                  },
                  {
                    title: "Awaiting Admin",
                    body: "Administrative coordination / pending admin action area.",
                  },
                  {
                    title: "Verification Board",
                    body: "Organized case overview for operational work.",
                  },
                  {
                    title: "All Verifications",
                    body: "Assigned, completed, on-hold, and escalated categories.",
                  },
                ].map((item) => (
                  <Reveal key={item.title} className="sp-panel p-5">
                    <h3 className="font-medium text-white">{item.title}</h3>
                    <p className="mt-2 text-sm text-[var(--color-muted)]">{item.body}</p>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          <section id="demo" className="sp-section bg-[#0b0a33]">
            <div className="sp-container">
              <Reveal className="mb-8 max-w-3xl">
                <p className="sp-eyebrow">Interactive demo</p>
                <h2 className="sp-heading mt-4 text-[clamp(28px,3.5vw,44px)]">
                  Verification board with filters
                </h2>
              </Reveal>
              <VerifierBoard />
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/contact/">
                  Explore verification partnerships <span aria-hidden>→</span>
                </ButtonLink>
                <ButtonLink href="/trust/" variant="ghost">
                  Trust & governance <span aria-hidden>→</span>
                </ButtonLink>
              </div>
            </div>
          </section>

          <section className="sp-section bg-[#090d33]">
            <div className="sp-container grid gap-4 md:grid-cols-3">
              {[
                "Reports: volume, accuracy, SLA (illustrative)",
                "Company profile, team, notifications, settings",
                "Queries / support for verifier operations",
              ].map((item) => (
                <Reveal key={item} className="sp-panel p-5">
                  <p className="text-sm text-[var(--color-muted)]">{item}</p>
                </Reveal>
              ))}
            </div>
          </section>
        </>
      }
    />
  );
}
