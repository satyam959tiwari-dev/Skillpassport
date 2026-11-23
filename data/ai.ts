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
      "“Suggest with AI” draft for Edit Profile → professional summary.",
    inputLabel: "Profile context",
    input:
      "Role: Frontend engineer\nSkills: React, TypeScript, Accessibility, design systems\nExperience: 4 years product teams\nDocuments: Degree certificate (verification in review)",
    outputLabel: "Suggested summary",
    output:
      "Frontend engineer with four years building accessible product interfaces in React and TypeScript. Experienced with design systems and collaborating across design and engineering. Degree verification is in review—edit this draft before saving.",
    note: "Turn your experience into a polished summary in seconds—then make it yours.",
  },
  {
    id: "assessment-reco",
    title: "AI assessment suggestions",
    description:
      "Suggestions aligned to profile skills or a target job.",
    inputLabel: "Profile / job focus",
    input:
      "Skills: React, TypeScript, Accessibility\nTarget role: Frontend engineer\nIntent: Prepare before applying",
    outputLabel: "Suggested assessments",
    output:
      "1) React component practical — state, composition, testing\n2) TypeScript fundamentals scenario — typing props, generics, narrowing\n3) Accessibility checklist — semantics, keyboard use, contrast\nAdd as drafts, then start when ready.",
    note: "Personalized skill assessments based on your profile and target roles—not generic tests.",
  },
  {
    id: "rubric",
    title: "AI form import → rubric draft",
    description:
      "From an uploaded assessment document to a structured rubric draft.",
    inputLabel: "Document context",
    input:
      "File: Accessibility_Practical.docx\nMode: auto (classify rubric vs checklist)\nHint: Prefer four performance levels; focus on keyboard and semantics",
    outputLabel: "Draft rubric outline",
    output:
      "Detected: Rubric\nCriteria (edit before publish):\n• Semantic structure & landmarks (0–3)\n• Keyboard navigation completeness (0–3)\n• Contrast & text alternatives (0–3)\n• Form labels & error messaging (0–3)\nNext: open AI Form Builder → refine → save draft → publish.",
    note: "Upload your existing assessment document. AI helps convert it into a structured rubric or checklist you can review and publish.",
  },
  {
    id: "form-builder",
    title: "Reviewer AI Form Builder",
    description:
      "Refinement step after AI form import — sections, fields, reorder, preview.",
    inputLabel: "Imported draft context",
    input:
      "Source: Accessibility_Practical.docx\nClassification: Rubric\nSections: Criteria · Evidence notes · Summary\nAction: Refine before publish",
    outputLabel: "Builder preview",
    output:
      "Title: Accessibility practical rubric\nSections (drag to reorder):\n1) Criteria — weighted performance levels\n2) Evidence notes — free-text reviewer comments\n3) Summary — grading overview\nActions available in product: preview · save draft · publish (human-controlled).",
    note: "Review and tune AI-generated forms before they go live.",
  },
  {
    id: "employer-query",
    title: "Employer good-practice AI query",
    description:
      "Reporting → AI Query match over good-practice patterns.",
    inputLabel: "Plain-language query",
    input:
      "Who on our talent picture shows strong mentoring practice and React architecture depth for a migration lead?",
    outputLabel: "Structured matches",
    output:
      "Signal focus: React architecture · mentoring · migration planning\nSuggested human filters: expert review notes on mentoring; assessment evidence on component architecture\nNext step: open shortlisted profiles and confirm verification status before outreach.",
    note: "Ask in plain language who fits a skill or practice pattern across your organization’s talent picture.",
  },
  {
    id: "admin-template",
    title: "Super Admin assessment templates",
    description:
      "AI-assisted assessment draft for catalog seeding — operators still review and publish.",
    inputLabel: "Assessment intent",
    input:
      "Catalog area: Frontend fundamentals\nGoal: Seed a practical assessment draft\nOperator: Super Admin",
    outputLabel: "Template draft",
    output:
      "Draft assessment: Frontend fundamentals practical\nSuggested structure: brief · tasks · evidence upload · scoring notes\nNext: human refine → required review/approval → publish to catalog.",
    note: "Platform operators can seed the assessment catalog faster with AI-generated drafts, then review and publish.",
  },
];

/** /ai hero showcase — six capability tiles, linked to the local demo examples above. */
export type AiShowcaseRole = "candidate" | "reviewer" | "employer" | "admin";

export const aiShowcase: Array<{
  id: string;
  demoId: string;
  title: string;
  lines: string[];
  role: AiShowcaseRole;
  audience: string;
  description: string;
  example: string;
}> = [
  {
    id: "summary",
    demoId: "candidate-summary",
    title: "Professional Summary",
    lines: ["Professional", "Summary"],
    role: "candidate",
    audience: "Candidates",
    description:
      "Suggests a professional summary from profile information. The candidate edits the draft before saving.",
    example:
      "Example: Frontend engineer, 4 years, React and TypeScript → “Frontend engineer experienced in building accessible web applications and collaborative product delivery.”",
  },
  {
    id: "assessments",
    demoId: "assessment-reco",
    title: "Assessment Suggestions",
    lines: ["Assessment", "Suggestions"],
    role: "candidate",
    audience: "Candidates",
    description:
      "Suggests assessments based on profile skills or a target job. Suggestions can be added as drafts, then started when ready.",
    example:
      "Skills: React, TypeScript, accessibility → suggested drafts: Web Accessibility Review; React Application Challenge.",
  },
  {
    id: "import",
    demoId: "rubric",
    title: "AI Form Import",
    lines: ["AI Form", "Import"],
    role: "reviewer",
    audience: "Reviewers",
    description:
      "A reviewer uploads an existing document and reviews an AI-created draft rubric or checklist. Nothing is published automatically.",
    example:
      "Document → draft rubric: Technical execution (40%), Quality and clarity (35%), Evidence and rationale (25%).",
  },
  {
    id: "builder",
    demoId: "form-builder",
    title: "AI Form Builder",
    lines: ["AI Form", "Builder"],
    role: "reviewer",
    audience: "Reviewers",
    description:
      "Visually refine imported sections, fields, grading scales and checklist items before previewing, saving or publishing.",
    example:
      "Adjust rating criteria, reorder sections, preview the draft checklist, then send it through the publishing step.",
  },
  {
    id: "query",
    demoId: "employer-query",
    title: "Good Practice AI Query",
    lines: ["Good", "Practice", "Query"],
    role: "employer",
    audience: "Employers",
    description:
      "Ask plain-language questions about skill and good-practice patterns to support team analysis and human decisions.",
    example:
      "Question: “Which skills should we prioritise for an accessible frontend team?” → themes: semantic HTML, keyboard testing, component accessibility.",
  },
  {
    id: "templates",
    demoId: "admin-template",
    title: "Assessment Templates",
    lines: ["Assessment", "Templates"],
    role: "admin",
    audience: "Super Admin",
    description:
      "Helps platform operators prepare draft assessment templates, which stay subject to human review before publishing.",
    example:
      "Template draft: Frontend Fundamentals — criteria for accessibility, code quality and testing. Status: Draft · requires review.",
  },
];
