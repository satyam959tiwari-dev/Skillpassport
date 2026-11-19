import Link from "next/link";
import { PageHero } from "@/components/hero/PageHero";
import { SignInForm } from "@/components/interactive/SignInForm";
import { Reveal } from "@/components/ui/Reveal";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata("signIn");

export default function SignInPage() {
  return (
    <>
      <PageHero
        eyebrow="Sign in"
        title={
          <>
            Sign in to explore the{" "}
            <span className="sp-gradient-text">demo experience</span>
          </>
        }
        description="This is a static marketing demonstration. It validates the form locally and does not log into the live SkillPassport application."
        primaryCta={{ label: "Jump to form", href: "#sign-in-form" }}
        secondaryCta={{ label: "Create Your Passport", href: "/create-passport/" }}
        visual="contact"
      />

      <section id="sign-in-form" className="sp-section bg-[#090d33]">
        <div className="sp-container grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <p className="sp-eyebrow">Demo authentication</p>
            <h2 className="sp-heading mt-4 text-[clamp(28px,3.5vw,44px)]">
              Static sign-in preview
            </h2>
            <p className="sp-lede mt-4">
              Use any sample email and password (6+ characters). Nothing is stored
              on a server. For the signup-style journey, use{" "}
              <Link href="/create-passport/" className="text-[var(--color-sky)] hover:underline">
                Create Your Passport
              </Link>
              .
            </p>
          </Reveal>
          <Reveal>
            <SignInForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
