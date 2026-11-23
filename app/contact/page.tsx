import { Clock, Mail, ShieldCheck } from "lucide-react";
import { ContactHero } from "@/components/hero/ContactHero";
import { ContactForm } from "@/components/interactive/ContactForm";
import { ContactRouteList } from "@/components/interactive/ContactRouteList";
import { Reveal } from "@/components/ui/Reveal";
import { appLinks } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata("contact");

const promises = [
  {
    icon: Clock,
    title: "Human follow-up",
    body: "A real person from the team reads and answers every message.",
  },
  {
    icon: Mail,
    title: "Email confirmation",
    body: "You get an email copy with a reference number.",
  },
  {
    icon: ShieldCheck,
    title: "Private by default",
    body: "Your details are only used to answer your inquiry.",
  },
] as const;

export default function ContactPage() {
  return (
    <>
      <ContactHero />

      <section id="contact-form" className="sp-section scroll-mt-28 bg-[radial-gradient(60%_50%_at_80%_20%,rgb(16_113_250/0.12),transparent_70%),#090d33]">
        <div className="sp-container grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <Reveal>
            <p className="sp-eyebrow">Get in touch</p>
            <h2 className="sp-heading mt-4 text-[clamp(28px,3.5vw,44px)]">
              Tell us what you&apos;re building
            </h2>
            <p className="sp-lede mt-4">
              Share a few details and we&apos;ll route your message to the right team. Prefer email?
              Write to{" "}
              <a
                className="text-[var(--color-sky)] underline-offset-2 hover:underline"
                href={appLinks.supportEmail}
              >
                support@skillpassport.com
              </a>
              .
            </p>
            <ul className="mt-8 space-y-4">
              {promises.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex items-start gap-4">
                  <span className="sp-icon-tile !size-11 shrink-0">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span>
                    <span className="block font-medium text-white">{title}</span>
                    <span className="mt-0.5 block text-sm text-[var(--color-muted)]">{body}</span>
                  </span>
                </li>
              ))}
            </ul>
            <ContactRouteList />
          </Reveal>
          <Reveal>
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
