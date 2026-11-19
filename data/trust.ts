export const trustTopics = [
  {
    id: "verify",
    title: "Reusable credential verification",
    body: "Verify once, reuse verification state with context across opportunities — not automatic success on upload.",
  },
  {
    id: "rubrics",
    title: "Weighted rubrics & performance levels",
    body: "Structured expert grading with criteria weights and performance levels.",
  },
  {
    id: "checklists",
    title: "Checklists & mandatory gates",
    body: "Met/not-met requirements, including mandatory gates where the product uses them.",
  },
  {
    id: "media",
    title: "PDF, video & document review",
    body: "Rich review workspaces for annotations, video evidence, and document previews.",
  },
  {
    id: "approvals",
    title: "Approval governance",
    body: "Assignment, media, and review-result approvals are distinct. Some platform/guest outcomes need admin approval before candidate visibility.",
  },
  {
    id: "permissions",
    title: "Fine-grained permissions & team roles",
    body: "Workspace permission slugs plus company roles such as admin, recruiter, reviewer, and verifier.",
  },
  {
    id: "public",
    title: "Public profiles & guest endorsements",
    body: "Shareable profiles and guest reviews can exist without login; visibility and approval rules still apply where documented.",
  },
  {
    id: "realtime",
    title: "Realtime in the existing application",
    body: "Permission, queue, team, and affiliate updates can sync live in the product app — not on this static marketing site.",
  },
  {
    id: "affiliate",
    title: "Referrals & affiliate relationship",
    body: "Candidate Refer & Earn connects conceptually to Super Admin Affiliate Management.",
  },
  {
    id: "support",
    title: "Support, audit & localization",
    body: "Raise Query, tickets, notifications, audit logs, and i18n infrastructure — explained here without pretending they run live on this site.",
  },
  {
    id: "security",
    title: "Company-scoped data & account security",
    body: "Documented product capabilities include company-scoped data handling and account-security controls in the existing application — explained here without inventing certifications or live security guarantees on this marketing site.",
  },
] as const;
