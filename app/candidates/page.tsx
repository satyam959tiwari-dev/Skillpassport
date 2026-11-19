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
  { href: "#demo", label: "Interactive demo" },
  { href: "#modules", label: "Modules" },
  { href: "#connect", label: "Connected roles" },
] as const;

export default function CandidatesPage() {
  return (
    <AudiencePage
      id="candidates"
      uniqueSections={
        <>
          <nav
            className="sticky top-0 z-30 border-b border-[var(--color-rule)] bg-[#090d33]/95 backdrop-blur"
            aria-label="On this page"
          >
            <div className="sp-container flex gap-2 overflow-x-auto py-3">
              {sectionNav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="shrink-0 rounded-full border border-[var(--color-rule)] px-3 py-1.5 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-sky)] hover:text-white"
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
                  Conceptual product journey for candidates. Stages explain capability
                  areas—not a mandatory sequence every person must complete.
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
                <p className="sp-eyebrow">Interactive demo</p>
                <h2 className="sp-heading mt-4 text-[clamp(28px,3.5vw,44px)]">
                  Explore candidate features with sample data
                </h2>
                <p className="sp-lede mt-4">
                  Tabs cover profile strength, documents, assessments (including AI
                  suggestion → draft → use template), jobs, sharing/guest reviews, Refer
                  & Earn, and Raise Query—all local to this browser.
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
                <p className="sp-eyebrow">Brief coverage</p>
                <h2 className="sp-heading mt-4 max-w-3xl text-[clamp(28px,3.5vw,44px)]">
                  Candidate modules represented here
                </h2>
              </Reveal>
              <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[
                  {
                    title: "Dashboard & profile strength",
                    body: "Completion progress updates as you edit the sample profile and evidence.",
                  },
                  {
                    title: "My Profile",
                    body: "Edit details, illustrative photo, visibility, and optional share link.",
                  },
                  {
                    title: "Documents",
                    body: "Upload concept with verification statuses: not submitted, in review, verified, needs info.",
                  },
                  {
                    title: "My Assessments · Add Media",
                    body: "Filter sample assessments and media submissions by type.",
                  },
                  {
                    title: "Self-Reviews · Expert Reviews",
                    body: "Self-evaluation and expert rubric paths shown as distinct evidence types.",
                  },
                  {
                    title: "Find Jobs · Saved · Applications",
                    body: "Local job search, save, and apply actions on sample listings.",
                  },
                  {
                    title: "Public profile & guest reviews",
                    body: "Visibility vs share link; guest endorsements with approval-where-applicable states.",
                  },
                  {
                    title: "Refer & Earn · Support",
                    body: "Referral demo, notifications/settings context, Raise Query ticket simulation.",
                  },
                  {
                    title: "AI suggestions",
                    body: "Editable summary draft; assessment suggestions with draft and Use template flow.",
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
                  Cross-links explain relationships. They do not open authenticated role
                  portals—this site remains a static marketing experience.
                </p>
              </Reveal>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    href: "/create-passport/",
                    title: "Create Your Passport",
                    body: "Hands-on static demo of digital skill identity.",
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
