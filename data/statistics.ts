/**
 * Configurable mock statistics for marketing only.
 * Replace with real figures when business provides them — never present as verified facts.
 */
export const platformStatistics = [
  {
    id: "professionals",
    value: "10,000+",
    label: "Professionals (illustrative)",
  },
  {
    id: "skills",
    value: "5,000+",
    label: "Skills & credentials (illustrative)",
  },
  {
    id: "organizations",
    value: "250+",
    label: "Organizations (illustrative)",
  },
  {
    id: "quality",
    value: "98%",
    label: "Verification quality target (goal, not a measured claim)",
  },
] as const;

export const statisticsDisclaimer =
  "Illustrative placeholders for layout and messaging only — not verified SkillPassport production metrics.";
