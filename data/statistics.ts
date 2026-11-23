/**
 * "Platform at a glance" facts — product facts from the brief, not usage metrics.
 * Never put invented counts, customers, or percentages here.
 */
export const platformStatistics = [
  {
    id: "roles",
    title: "Six connected roles",
    label: "Candidates, employers, verifier companies, reviewers, Super Admin, and Organization Admin in one workflow.",
  },
  {
    id: "reuse",
    title: "Verify once, reuse everywhere",
    label: "A checked credential keeps its status across the profile, applications, and Talent Search.",
  },
  {
    id: "graded",
    title: "Structured grading",
    label: "Rubrics with weighted criteria and performance levels; checklists with met / not met and mandatory items.",
  },
  {
    id: "governed",
    title: "Human-approved outcomes",
    label: "Sensitive results pass admin approval, and operator actions are recorded in Audit Logs.",
  },
] as const;

export const statisticsDisclaimer =
  "What every role can rely on — product facts, not usage figures.";
