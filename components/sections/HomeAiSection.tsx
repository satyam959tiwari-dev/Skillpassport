"use client";

import dynamic from "next/dynamic";

const AiDemoLab = dynamic(
  () => import("@/components/interactive/AiDemoLab").then((m) => m.AiDemoLab),
  {
    ssr: false,
    loading: () => (
      <div className="sp-panel p-8 text-sm text-[var(--color-faint)]">
        Loading AI demos…
      </div>
    ),
  },
);

export function HomeAiSection() {
  return <AiDemoLab />;
}
