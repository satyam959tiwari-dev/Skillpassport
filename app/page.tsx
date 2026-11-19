import { HomeHero } from "@/components/hero/HomeHero";
import { HomeSections } from "@/components/sections/HomeSections";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata("home");

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <HomeSections />
    </>
  );
}
