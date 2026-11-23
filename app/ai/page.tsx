import { AiHero } from "@/components/hero/AiHero";
import { AiCapabilityGrid } from "@/components/interactive/AiCapabilityGrid";
import { AiDemoLab } from "@/components/interactive/AiDemoLab";
import { Reveal } from "@/components/ui/Reveal";
import {
  aiBoundaries,
  aiPrinciples,
  notGenerativeAi,
} from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata("ai");

export default function AiPage() {
  return (
    <>
      <AiHero />

      <section id="capabilities" className="sp-section scroll-mt-24 bg-[#090d33]">
        <div className="sp-container">
          <Reveal>
            <p className="sp-eyebrow">Six capabilities</p>
            <h2 className="sp-heading mt-4 max-w-3xl text-[clamp(28px,3.5vw,44px)]">
              Where AI can assist
            </h2>
          </Reveal>
          <AiCapabilityGrid />
        </div>
      </section>

      <section className="sp-section bg-[#0b0a33]">
        <div className="sp-container">
          <Reveal>
            <p className="sp-eyebrow">Boundaries</p>
            <h2 className="sp-heading mt-4 max-w-3xl text-[clamp(28px,3.5vw,44px)]">
              Clearly distinguish assistance from trust
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {aiBoundaries.map((item) => (
              <Reveal key={item.id} className="sp-panel p-5">
                <h3 className="text-sm font-medium text-white">{item.label}</h3>
                <p className="mt-2 text-sm text-[var(--color-muted)] leading-relaxed">
                  {item.body}
                </p>
              </Reveal>
            ))}
          </div>
          <div className="mt-8 rounded-xl border border-[var(--color-rule)] bg-inset p-5">
            <p className="text-xs tracking-[0.14em] text-[var(--color-sky)] uppercase">
              Not generative AI
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {notGenerativeAi.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-[var(--color-rule)] px-3 py-1.5 text-sm text-[var(--color-muted)]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="sp-section bg-[linear-gradient(#0b0a33,#120f47)]">
        <div className="sp-container grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <p className="sp-eyebrow">Principles</p>
            <h2 className="sp-heading mt-4 text-[clamp(28px,3.5vw,44px)]">
              Clear limits. Clear accountability.
            </h2>
          </Reveal>
          <ul className="space-y-4">
            {aiPrinciples.map((line) => (
              <Reveal key={line} className="sp-panel p-5 text-[var(--color-muted)] leading-relaxed">
                {line}
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section id="demos" className="sp-section bg-[#090d33]">
        <div className="sp-container">
          <Reveal className="mb-8 max-w-3xl">
            <p className="sp-eyebrow">Try it</p>
            <h2 className="sp-heading mt-4 text-[clamp(28px,3.5vw,44px)]">
              See each capability at work
            </h2>
          </Reveal>
          <AiDemoLab />
        </div>
      </section>
    </>
  );
}
