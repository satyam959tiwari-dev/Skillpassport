import type { Metadata } from "next";
import { pageMeta, siteName, siteUrl } from "@/lib/content";

export function buildMetadata(key: keyof typeof pageMeta): Metadata {
  const page = pageMeta[key];
  const url = `${siteUrl}${page.path}`;
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: page.path },
    openGraph: {
      title: page.title,
      description: page.description,
      url,
      siteName,
      type: "website",
      images: [
        {
          url: "/images/skillpassport-logo.png",
          width: 1536,
          height: 1024,
          alt: "SkillPassport",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: ["/images/skillpassport-logo.png"],
    },
  };
}
