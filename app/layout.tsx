import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { buildMetadata } from "@/lib/seo";
import { siteName, siteTagline, siteUrl } from "@/lib/content";
import "@/styles/globals.css";

export const metadata: Metadata = {
  ...buildMetadata("home"),
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  keywords: [
    "SkillPassport",
    "skill verification",
    "credential verification",
    "trusted hiring",
    "expert reviews",
    "assessments",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  robots: { index: true, follow: true },
  icons: {
    icon: "/images/skillpassport-logo.png",
  },
  openGraph: {
    ...buildMetadata("home").openGraph,
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
        />
        <meta name="theme-color" content="#090d33" />
        <meta name="description" content={buildMetadata("home").description as string} />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-[var(--color-violet-hi)] focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <div id="main-content">{children}</div>
        <SiteFooter />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: siteName,
              url: siteUrl,
              slogan: siteTagline,
              description:
                "Verify credentials · Prove skills · Hire with trust. One trust workflow for candidates, employers, verifiers, reviewers, and admins.",
              logo: `${siteUrl}/images/masterpiece-logo.png`,
              email: "support@skillpassport.com",
            }),
          }}
        />
      </body>
    </html>
  );
}
