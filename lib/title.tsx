import type { ReactNode } from "react";

/**
 * Highlights the first case-insensitive match of `accent` inside `headline`
 * with the homepage logo gradient (same treatment as “everywhere.”).
 */
export function accentHeadline(headline: string, accent: string): ReactNode {
  const idx = headline.toLowerCase().indexOf(accent.toLowerCase());
  if (idx < 0) return headline;

  const before = headline.slice(0, idx);
  const match = headline.slice(idx, idx + accent.length);
  const after = headline.slice(idx + accent.length);

  return (
    <>
      {before}
      <span className="sp-gradient-text">{match}</span>
      {after}
    </>
  );
}
