import type { AiDemoExample } from "@/types";

/** Six AI capabilities — marketing copy aligned to the product brief. */
export const aiCapabilities = [
  {
    id: "summary",
    owner: "Candidate",
    title: "Professional Summary Suggestion",
    where: "Edit Profile → professional summary",
    message:
      "Turn your experience into a polished summary in seconds—then make it yours.",
    description:
      "AI generates a draft summary from profile information. The candidate reviews and edits before saving.",
  },
  {
    id: "assessment-suggest",
    owner: "Candidate",
    title: "Assessment Suggestions",
    where: "Browse / My Assessments → AI Suggestion",
    message:
      "Personalized skill assessments based on your profile and target roles—not generic tests.",
    description:
      "Suggests assessments from profile skills or a target job. Add as drafts, then Use template when ready.",
  },
  {
    id: "form-import",
    owner: "Reviewer",
    title: "AI Form Import",
    where: "Forms library → AI form import",
    message:
      "Upload your existing assessment document. AI helps convert it into a structured rubric or checklist you can review and publish.",
    description:
      "Upload PDF, Word, text, or Markdown. AI classifies rubric vs checklist, generates a draft, and optional context shapes the result.",
  },
  {
    id: "form-builder",
    owner: "Reviewer",
    title: "AI Form Builder",
    where: "After import",
    message: "Review and tune AI-generated forms before they go live.",
    description:
      "Visual refinement for imported forms: sections, fields, reorder, preview, save draft, and publish — not a separate chatbot.",
  },
  {
    id: "good-practice",
    owner: "Employer",
    title: "Good Practice AI Query",
    where: "Reporting → AI Query",
    message:
      "Ask in plain language who fits a skill or practice pattern across your organization’s talent picture.",
    description:
      "Natural-language exploration of skills, practice patterns, talent signals, skill gaps, and hiring context.",
  },
  {
    id: "admin-templates",
    owner: "Super Admin",
    title: "Assessment Template Assistance",
    where: "Assessment creation / catalog seeding",
    message:
      "Platform operators can seed the assessment catalog faster with AI-generated drafts, then review and publish.",
    description:
      "AI helps create assessment drafts and templates. Important outputs remain subject to human review.",
  },
] as const;

export const aiCorePrinciple = "AI accelerates work. Humans remain in control.";

export const aiPrinciples = [
  "AI speeds content creation and suggestions — it does not replace verification, expert grading, or admin approvals.",
  "Drafts are editable; publish and sensitive outcomes stay behind human and admin gates where the product requires them.",
  "This marketing site uses predefined local examples only — no live generative API calls.",
] as const;

/** Clear distinction: what is / is not generative AI. */
export const aiBoundaries = [
  {
    id: "ai",
    label: "AI Assistance",
    body: "The six capabilities above — drafts, suggestions, form import, good-practice query, templates.",
  },
  {
    id: "human",
    label: "Human Review",
    body: "Candidates edit drafts; reviewers refine and publish; operators approve sensitive outcomes.",
  },
  {
    id: "verification",
    label: "Verification",
    body: "Credential checks by verifier companies — not an AI decision.",
  },
  {
    id: "governance",
    label: "Governance",
    body: "Admin approvals, permissions, and audit — not generative AI.",
  },
  {
    id: "automation",
    label: "Automation",
    body: "Queues, notifications, and workflow status — operational, not LLM-generated trust.",
  },
] as const;

export const notGenerativeAi = [
  "Location pickers / address autocomplete",
  "Curated Reviewer Good Practices content",
  "Guest reviews and human endorsements",
  "Administrative approvals",
] as const;

export const aiDemos: AiDemoExample[] = [
  {
    id: "candidate-summary",
    title: "Candidate summary suggestion",
    description:
      "Illustrative “Suggest with AI” draft for Edit Profile → professional summary.",
    inputLabel: "Sample profile context",
    input:
      "Role: Frontend engineer\nSkills: React, TypeScript, Accessibility, design systems\nExperience: 4 years product teams\nDocuments: Degree certificate (verification in review)",
    outputLabel: "Suggested summary (illustrative)",
    output:
      "Frontend engineer with four years building accessible product interfaces in React and TypeScript. Experienced with design systems and collaborating across design and engineering. Degree verification is in review—edit this draft before saving.",
    note: "Turn your experience into a polished summary in seconds—then make it yours. Local mock only.",
  },
  {
    id: "assessment-reco",
    title: "AI assessment suggestions",
    description:
      "Illustrative suggestions aligned to profile skills or a target job.",
    inputLabel: "Profile / job focus",
    input:
      "Skills: React, TypeScript, Accessibility\nTarget role: Frontend engineer\nIntent: Prepare before applying",
    outputLabel: "Suggested assessments (illustrative)",
    output:
      "1) React component practical — state, composition, testing\n2) TypeScript fundamentals scenario — typing props, generics, narrowing\n3) Accessibility checklist — semantics, keyboard use, contrast\nAdd as drafts, then start when ready.",
    note: "Personalized skill assessments based on your profile and target roles—not generic tests. Local mock only.",
  },
  {
    id: "rubric",
    title: "AI form import → rubric draft",
    description:
      "Illustrative path from an uploaded assessment doc to a structured rubric draft.",
    inputLabel: "Document context (illustrative)",
    input:
      "File: Accessibility_Practical.docx\nMode: auto (classify rubric vs checklist)\nHint: Prefer four performance levels; focus on keyboard and semantics",
    outputLabel: "Draft rubric outline (illustrative)",
    output:
      "Detected: Rubric\nCriteria (edit before publish):\n• Semantic structure & landmarks (0–3)\n• Keyboard navigation completeness (0–3)\n• Contrast & text alternatives (0–3)\n• Form labels & error messaging (0–3)\nNext: open AI Form Builder → refine → save draft → publish.",
    note: "Upload your existing assessment document. AI helps convert it into a structured rubric or checklist you can review and publish. Local mock only.",
  },
  {
    id: "form-builder",
    title: "Reviewer AI Form Builder",
    description:
      "Illustrative refinement step after AI form import — sections, fields, reorder, preview.",
    inputLabel: "Imported draft context",
    input:
      "Source: Accessibility_Practical.docx\nClassification: Rubric\nSections: Criteria · Evidence notes · Summary\nAction: Refine before publish",
    outputLabel: "Builder preview (illustrative)",
    output:
      "Title: Accessibility practical rubric\nSections (reorder locally in Reviewer demo):\n1) Criteria — weighted performance levels\n2) Evidence notes — free-text reviewer comments\n3) Summary — grading overview\nActions available in product: preview · save draft · publish (human-controlled).",
    note: "Review and tune AI-generated forms before they go live. Local mock only.",
  },
  {
    id: "employer-query",
    title: "Employer good-practice AI query",
    description:
      "Illustrative Reporting → AI Query style match over good-practice patterns.",
    inputLabel: "Plain-language query",
    input:
      "Who on our talent picture shows strong mentoring practice and React architecture depth for a migration lead?",
    outputLabel: "Structured matches (illustrative)",
    output:
      "Signal focus: React architecture · mentoring · migration planning\nSuggested human filters: expert review notes on mentoring; assessment evidence on component architecture\nNext step: open shortlisted profiles and confirm verification status before outreach.",
    note: "Ask in plain language who fits a skill or practice pattern across your organization’s talent picture. Local mock only.",
  },
  {
    id: "admin-template",
    title: "Super Admin assessment templates",
    description:
      "Illustrative AI-assisted assessment draft for catalog seeding — operators still review and publish.",
    inputLabel: "Assessment intent",
    input:
      "Catalog area: Frontend fundamentals\nGoal: Seed a practical assessment draft\nOperator: Super Admin",
    outputLabel: "Template draft (illustrative)",
    output:
      "Draft assessment: Frontend fundamentals practical\nSuggested structure: brief · tasks · evidence upload · scoring notes\nNext: human refine → required review/approval → publish to catalog.",
    note: "Platform operators can seed the assessment catalog faster with AI-generated drafts, then review and publish. Local mock only.",
  },
];
