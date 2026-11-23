import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import {
  PageHeroVisual,
  type HeroVisualVariant,
} from "@/components/hero/PageHeroVisual";

type Props = {
  eyebrow: string;
  title: ReactNode;
  description: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  align?: "left" | "center";
  visual?: HeroVisualVariant;
};

export function PageHero({
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
  align = "left",
  visual,
}: Props) {
  const centered = align === "center" && !visual;

  return (
    <div className="relative">
      {/* Brand ground — navy → indigo → logo blues, synced with homepage hero.
          Decorative layer is clipped; header stays outside so dropdowns are not cut off. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(55% 55% at 12% 40%, rgb(22 17 82 / 0.98) 0%, transparent 70%),
              radial-gradient(42% 48% at 88% 18%, rgb(16 113 250 / 0.22) 0%, transparent 62%),
              radial-gradient(38% 42% at 78% 78%, rgb(68 30 182 / 0.32) 0%, transparent 65%),
              linear-gradient(105deg, #090d33 0%, #090d33 42%, #05071c 68%, #030508 100%)
            `,
          }}
        />
        <div
          className="absolute inset-x-0 top-0 h-40"
          style={{
            background:
              "linear-gradient(180deg, rgb(3 5 8 / 0.75) 0%, transparent 100%)",
          }}
        />
        {/* Seamless hand-off to the next section (no hard rule) */}
        <div
          className="absolute inset-x-0 bottom-0 h-28"
          style={{ background: "linear-gradient(180deg, rgb(9 13 51 / 0) 0%, #090d33 100%)" }}
        />
      </div>

      <SiteHeader variant="page" />

      <div className="sp-container relative z-10 overflow-visible pb-16 pt-8 sm:pb-20 sm:pt-12">
        <div
          className={
            visual
              ? "grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)] lg:gap-12 xl:gap-16"
              : undefined
          }
        >
          <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
            <p className={`sp-eyebrow sp-rise sp-rise-1 ${centered ? "justify-center" : ""}`}>
              {eyebrow}
            </p>
            <h1 className="sp-heading sp-rise sp-rise-2 mt-5 text-[clamp(36px,5.4vw,64px)] text-white">
              {title}
            </h1>
            <p className={`sp-lede sp-rise sp-rise-3 mt-5 ${centered ? "mx-auto" : ""}`}>
              {description}
            </p>
            {(primaryCta || secondaryCta) && (
              <div
                className={`sp-rise sp-rise-4 mt-8 flex flex-wrap items-center gap-4 ${
                  centered ? "justify-center" : ""
                }`}
              >
                {primaryCta ? (
                  <ButtonLink href={primaryCta.href}>{primaryCta.label}</ButtonLink>
                ) : null}
                {secondaryCta ? (
                  <ButtonLink href={secondaryCta.href} variant="ghost">
                    {secondaryCta.label} <span aria-hidden>→</span>
                  </ButtonLink>
                ) : null}
              </div>
            )}
          </div>

          {visual ? (
            <div className="sp-rise sp-rise-5 relative mx-auto w-full max-w-[520px] lg:mx-0 lg:max-w-none">
              <PageHeroVisual variant={visual} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
