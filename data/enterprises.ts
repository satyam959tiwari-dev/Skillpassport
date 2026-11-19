export const superAdminGroups = [
  {
    id: "dashboard",
    title: "Platform Dashboard",
    items: ["KPIs", "Alerts", "Applications", "Courses (dashboard context)", "Verification progress"],
  },
  {
    id: "people",
    title: "People & Hiring",
    items: ["Candidates", "Job Companies", "Jobs", "Applications"],
  },
  {
    id: "verification",
    title: "Verification",
    items: ["Verifier Companies", "Verification requests/cases", "Rejection log"],
  },
  {
    id: "reviews",
    title: "Review Management",
    items: ["Reviewers", "Forms"],
  },
  {
    id: "assessments",
    title: "Assessments & Approvals",
    items: [
      "Assessment approval requests",
      "Media approval requests",
      "Review Results approval (where applicable)",
      "Assessment catalog",
    ],
  },
  {
    id: "orgs",
    title: "Organization Governance",
    items: ["Organizations", "Users & Roles", "Permissions"],
  },
  {
    id: "management",
    title: "Platform Management",
    items: ["Settings", "Skill Catalog", "Billing & Plans (admin module, not public pricing)"],
  },
  {
    id: "affiliates",
    title: "Affiliates",
    items: ["Affiliate Management", "Campaigns", "Reports"],
  },
  {
    id: "support",
    title: "Accountability & Support",
    items: ["Audit Logs", "Messages", "Notifications", "Support Tickets"],
  },
  {
    id: "ai",
    title: "AI assistance",
    items: ["AI-assisted assessment templates (draft → human publish)"],
  },
] as const;

export const orgAdminCapabilities = [
  {
    id: "members",
    title: "Organization members",
    body: "Manage members inside the organization scope.",
  },
  {
    id: "modules",
    title: "Available modules",
    body: "See which modules are available to the organization.",
  },
  {
    id: "admin",
    title: "Organization administration",
    body: "Tenant-specific administration for the organization workspace.",
  },
  {
    id: "roles",
    title: "Scoped roles & permissions",
    body: "Organization-level roles and access — not platform-wide Super Admin powers.",
  },
] as const;

export const sampleApprovalQueues = [
  { id: "ap1", type: "Assessment approval request", state: "Pending (demo)" },
  { id: "ap2", type: "Media approval request", state: "Pending (demo)" },
  { id: "ap3", type: "Review-result approval (platform/guest context)", state: "Pending (demo)" },
  { id: "ap4", type: "Assignment-related approval request", state: "Pending (demo)" },
] as const;

export const sampleOrgMembers = [
  { id: "m1", name: "Member 01", role: "Organization Admin" },
  { id: "m2", name: "Member 02", role: "Member" },
  { id: "m3", name: "Member 03", role: "Member" },
] as const;

export const samplePeopleInventory = {
  candidates: {
    label: "Candidates",
    total: "1,240 (demo)",
    rows: [
      { name: "Candidate 014", meta: "Profile 82% · 2 documents in review" },
      { name: "Candidate 027", meta: "Profile 64% · public profile on" },
      { name: "Candidate 031", meta: "Profile 91% · 3 assessments done" },
    ],
  },
  companies: {
    label: "Job companies",
    total: "86 (demo)",
    rows: [
      { name: "Job Company A", meta: "4 open jobs · 12 team seats" },
      { name: "Job Company B", meta: "2 open jobs · 5 team seats" },
      { name: "Job Company C", meta: "Onboarding · profile incomplete" },
    ],
  },
  jobs: {
    label: "Jobs",
    total: "212 (demo)",
    rows: [
      { name: "Frontend engineer", meta: "Job Company A · published" },
      { name: "Data analyst", meta: "Job Company B · draft" },
      { name: "QA lead", meta: "Job Company A · closed" },
    ],
  },
  applications: {
    label: "Applications",
    total: "128 open (demo)",
    rows: [
      { name: "Candidate 014 → Frontend engineer", meta: "Interview scheduled" },
      { name: "Candidate 027 → Data analyst", meta: "Applied" },
      { name: "Candidate 031 → QA lead", meta: "Shortlisted" },
    ],
  },
} as const;

export type PeopleInventoryKey = keyof typeof samplePeopleInventory;

export const sampleVerificationCases = [
  { id: "vc1", subject: "Degree certificate · Candidate 014", verifier: "Verifier Co. A", state: "In review" },
  { id: "vc2", subject: "Employment letter · Candidate 027", verifier: "Verifier Co. B", state: "Needs info" },
  { id: "vc3", subject: "Course certificate · Candidate 031", verifier: "Verifier Co. A", state: "Verified" },
] as const;

export const sampleRejectionLog = [
  {
    id: "rj1",
    subject: "ID document · Candidate 019",
    reason: "Image unreadable — resubmit a clearer scan",
    when: "Today (demo)",
  },
  {
    id: "rj2",
    subject: "Experience letter · Candidate 044",
    reason: "Issuer details could not be confirmed",
    when: "Yesterday (demo)",
  },
] as const;

export const sampleOrganizations = [
  { id: "o1", name: "Organization A", members: 3, plan: "Team", roles: ["Organization Admin", "Member"] },
  { id: "o2", name: "Organization B", members: 8, plan: "Business", roles: ["Organization Admin", "Member", "Reviewer"] },
  { id: "o3", name: "Organization C", members: 1, plan: "Trial", roles: ["Organization Admin"] },
] as const;

export const sampleSkillCatalog = ["React", "TypeScript", "Accessibility", "Data analysis"] as const;

export const sampleBillingPlans = [
  { id: "bp1", name: "Trial", seats: "Up to 3 seats", price: "Free (sample)" },
  { id: "bp2", name: "Team", seats: "Up to 10 seats", price: "Sample rate" },
  { id: "bp3", name: "Business", seats: "Up to 50 seats", price: "Sample rate" },
] as const;

export const sampleReviewers = [
  { id: "rv1", name: "Reviewer 01", focus: "Frontend", status: "Active" },
  { id: "rv2", name: "Reviewer 02", focus: "Accessibility", status: "Active" },
  { id: "rv3", name: "Reviewer 03", focus: "Data", status: "Paused" },
] as const;

export const sampleReviewForms = [
  { id: "fm1", name: "Practical review rubric", fields: 6, status: "Published" },
  { id: "fm2", name: "Guest endorsement form", fields: 3, status: "Published" },
  { id: "fm3", name: "Portfolio feedback form", fields: 5, status: "Draft" },
] as const;

export const sampleSupportMessages = [
  "Message: welcome note for new verifier companies",
  "Notification: verification escalation alert",
] as const;

export const sampleAffiliateCampaign = {
  name: "Spring referral",
  status: "Active (sample)",
  clicks: 124,
  signups: 18,
} as const;

export const sampleOrgModules = [
  { id: "mod-assess", name: "Hiring assessments", enabled: true },
  { id: "mod-seats", name: "Team seats & invites", enabled: true },
  { id: "mod-report", name: "Org reporting", enabled: false },
] as const;

export const orgPermissionSlugs = [
  { slug: "members.manage", label: "Manage members" },
  { slug: "modules.configure", label: "Configure modules" },
  { slug: "reports.view", label: "View org reports" },
] as const;

export const orgRoleNames = ["Organization Admin", "Member"] as const;
export type OrgRoleName = (typeof orgRoleNames)[number];
