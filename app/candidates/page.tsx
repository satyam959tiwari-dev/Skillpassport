import { CandidateHero } from "@/components/hero/CandidateHero";
import { CandidateExperience } from "@/components/interactive/CandidateExperience";
import { AudiencePage } from "@/components/sections/AudiencePage";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Reveal } from "@/components/ui/Reveal";
import { candidateJourneySteps } from "@/data/candidates";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata("candidates");

const sectionNav = [
  { href: "#why", label: "Why" },
  { href: "#candidate-journey", label: "Journey" },
  { href: "#demo", label: "Try it" },
  { href: "#modules", label: "Modules" },
  { href: "#connect", label: "Connected roles" },
] as const;

export default function CandidatesPage() {
  return (
    <AudiencePage
      id="candidates"
      hero={<CandidateHero />}
      uniqueSections={
        <>
          <nav
            className="sp-subnav-sticky z-30"
            aria-label="On this page"
          >
            <div className="sp-container sp-subnav-scroll flex gap-2 overflow-x-auto py-3">
              {sectionNav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="shrink-0 rounded-full border border-[rgb(140_196_255/0.24)] bg-white/[0.05] px-3 py-1.5 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-sky)] hover:bg-[rgb(98_172_250/0.12)] hover:text-white"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </nav>

          <section id="why" className="sp-section bg-[linear-gradient(#090d33,#0b0a33)]">
            <div className="sp-container grid gap-8 lg:grid-cols-2 lg:items-center">
              <Reveal>
                <p className="sp-eyebrow">Why SkillPassport</p>
                <h2 className="sp-heading mt-4 text-[clamp(28px,3.5vw,44px)]">
                  Ordinary claims vs evidence-backed identity
                </h2>
                <p className="sp-lede mt-4">
                  Resumes assert skills. SkillPassport gathers profile, documents,
                  assessments, and expert reviews so trust can travel with you—into jobs,
                  sharing, and verification workflows.
                </p>
              </Reveal>
              <Reveal className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    title: "Claims without proof",
                    body: "Self-reported skills are hard for employers to inspect consistently.",
                  },
                  {
                    title: "Evidence in one place",
                    body: "Documents, assessments, media, and reviews sit with profile strength.",
                  },
                  {
                    title: "Verification status",
                    body: "Upload starts a tracked workflow—it does not auto-verify credentials.",
                  },
                  {
                    title: "Human oversight",
                    body: "AI drafts help; guest reviews and sensitive outcomes can need approval.",
                  },
                ].map((item) => (
                  <div key={item.title} className="sp-panel p-5">
                    <h3 className="font-medium text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                      {item.body}
                    </p>
                  </div>
                ))}
              </Reveal>
            </div>
          </section>

          <section id="candidate-journey" className="sp-section bg-[#0b0a33]">
            <div className="sp-container">
              <Reveal>
                <p className="sp-eyebrow">Candidate journey</p>
                <h2 className="sp-heading mt-4 max-w-3xl text-[clamp(28px,3.5vw,44px)]">
                  From profile to proof—and opportunity
                </h2>
                <p className="sp-lede mt-4 max-w-2xl">
                  The same steps as the platform story, seen from your side — take them in
                  whatever order suits you.
                </p>
              </Reveal>
              <ol className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {candidateJourneySteps.map((step, i) => (
                  <Reveal key={step.id} className="sp-panel p-5">
                    <span className="text-sm text-[var(--color-sky)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-2 text-lg font-medium text-white">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                      {step.body}
                    </p>
                  </Reveal>
                ))}
              </ol>
            </div>
          </section>

          <section id="demo" className="sp-section bg-[linear-gradient(#0b0a33,#090d33)]">
            <div className="sp-container">
              <Reveal className="mb-8 max-w-3xl">
                <p className="sp-eyebrow">Try it</p>
                <h2 className="sp-heading mt-4 text-[clamp(28px,3.5vw,44px)]">
                  Explore the candidate workspace
                </h2>
                <p className="sp-lede mt-4">
                  Tabs cover profile strength, documents, assessments (including AI
                  suggestion → draft → use template), jobs, sharing/guest reviews, Refer
                  & Earn, and Raise Query — changes in one tab carry into the others.
                </p>
              </Reveal>
              <CandidateExperience />
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/create-passport/">
                  Create Your Passport <span aria-hidden>→</span>
                </ButtonLink>
                <ButtonLink href="/ai/" variant="ghost">
                  See AI capabilities <span aria-hidden>→</span>
                </ButtonLink>
              </div>
            </div>
          </section>

          <section id="modules" className="sp-section bg-[#090d33]">
            <div className="sp-container">
              <Reveal>
                <p className="sp-eyebrow">Features</p>
                <h2 className="sp-heading mt-4 max-w-3xl text-[clamp(28px,3.5vw,44px)]">
                  Everything in the candidate portal
                </h2>
              </Reveal>
              <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[
                  {
                    title: "Dashboard & profile strength",
                    body: "Completion progress updates as you add profile details and evidence.",
                  },
                  {
                    title: "My Profile",
                    body: "Edit details and photo, set visibility, and turn on an optional share link.",
                  },
                  {
                    title: "Documents",
                    body: "Upload documents and track each status: not submitted, in review, verified, needs info.",
                  },
                  {
                    title: "My Assessments · Add Media",
                    body: "Take assessments and submit media, filtered by type.",
                  },
                  {
                    title: "Self-Reviews · Expert Reviews",
                    body: "Rate yourself, or request an expert review graded on a rubric or checklist.",
                  },
                  {
                    title: "Find Jobs · Saved · Applications",
                    body: "Search jobs, save the ones you like, and track your applications.",
                  },
                  {
                    title: "Public profile & guest reviews",
                    body: "Choose who sees your profile, share a link, and invite guest reviews — an admin may approve them first.",
                  },
                  {
                    title: "Refer & Earn · Support",
                    body: "Share your referral link, manage notifications, and Raise Query with ticket tracking.",
                  },
                  {
                    title: "AI suggestions",
                    body: "Suggest with AI drafts your summary; AI assessment suggestions become drafts you start with Use template.",
                  },
                ].map((item) => (
                  <Reveal key={item.title} className="sp-panel p-6">
                    <h3 className="text-lg font-medium text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
                      {item.body}
                    </p>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          <section id="connect" className="sp-section bg-[#0b0a33]">
            <div className="sp-container">
              <Reveal>
                <p className="sp-eyebrow">Connected roles</p>
                <h2 className="sp-heading mt-4 max-w-3xl text-[clamp(28px,3.5vw,44px)]">
                  How candidates relate to the rest of the ecosystem
                </h2>
                <p className="sp-lede mt-4 max-w-2xl">
                  Your passport is what verifiers check, reviewers grade, and employers
                  search — see how each role works with it.
                </p>
              </Reveal>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    href: "/create-passport/",
                    title: "Create Your Passport",
                    body: "Build your passport in a few guided steps.",
                  },
                  {
                    href: "/verifiers/",
                    title: "For Verifiers",
                    body: "Where credential cases are operated and tracked.",
                  },
                  {
                    href: "/reviewers/",
                    title: "For Reviewers",
                    body: "Where assessments and media are evaluated with structure.",
                  },
                  {
                    href: "/employers/",
                    title: "For Employers",
                    body: "Where evidence supports talent search and hiring workflows.",
                  },
                ].map((item) => (
                  <Reveal key={item.href} className="sp-panel p-5">
                    <h3 className="text-lg font-medium text-white">{item.title}</h3>
                    <p className="mt-2 text-sm text-[var(--color-muted)]">{item.body}</p>
                    <ButtonLink href={item.href} variant="ghost" className="mt-4 !px-0">
                      Open <span aria-hidden>→</span>
                    </ButtonLink>
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
