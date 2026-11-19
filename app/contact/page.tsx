import { PageHero } from "@/components/hero/PageHero";
import { ContactForm } from "@/components/interactive/ContactForm";
import { Reveal } from "@/components/ui/Reveal";
import { appLinks } from "@/lib/content";
import { accentHeadline } from "@/lib/title";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata("contact");

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={accentHeadline(
          "Talk with the SkillPassport team",
          "SkillPassport",
        )}
        description="Use the demo form to preview how an inquiry flow feels, or email support directly. The on-site form does not transmit a real inquiry."
        primaryCta={{ label: "Jump to demo form", href: "#contact-form" }}
        secondaryCta={{ label: "Create Your Passport", href: "/create-passport/" }}
        visual="contact"
      />

      <section id="contact-form" className="sp-section bg-[#090d33]">
        <div className="sp-container grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <p className="sp-eyebrow">Get in touch</p>
            <h2 className="sp-heading mt-4 text-[clamp(28px,3.5vw,44px)]">
              Demo inquiry form
            </h2>
            <p className="sp-lede mt-4">
              Validation, loading states, and success feedback all run locally.
              For a real conversation, use{" "}
              <a
                className="text-[var(--color-sky)] underline-offset-2 hover:underline"
                href={appLinks.supportEmail}
              >
                support@skillpassport.com
              </a>
              .
            </p>
            <ul className="mt-8 space-y-3 text-sm text-[var(--color-muted)]">
              <li>Candidates · Employers · Verifiers</li>
              <li>Expert reviewers · Enterprises</li>
              <li>Partnership and product questions</li>
            </ul>
          </Reveal>
          <Reveal>
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
