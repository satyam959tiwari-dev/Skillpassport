export const employerTalentSamples = [
  {
    id: "t1",
    name: "Meera Iyer",
    role: "Frontend Engineer",
    skills: ["React", "TypeScript", "Accessibility"],
    credential: "Certificate verified",
    evidence: "Assessment evidence available",
  },
  {
    id: "t2",
    name: "Rohan Shah",
    role: "Full-stack Engineer",
    skills: ["Node.js", "SQL", "React"],
    credential: "Degree in review",
    evidence: "Self-review + media attached",
  },
  {
    id: "t3",
    name: "Priya Kapoor",
    role: "Product Engineer",
    skills: ["TypeScript", "System design", "Communication"],
    credential: "License needs info",
    evidence: "Expert review queued",
  },
] as const;

export const employerPipelineStages = [
  "Applied",
  "Assessment",
  "Interview",
  "Evaluated",
] as const;

export type EmployerPipelineStage = (typeof employerPipelineStages)[number];

export const employerApplicants = [
  { id: "a1", name: "Meera Iyer", job: "Frontend Engineer", stage: "Applied" as EmployerPipelineStage },
  { id: "a2", name: "Rohan Shah", job: "Full-stack Engineer", stage: "Assessment" as EmployerPipelineStage },
  { id: "a3", name: "Priya Kapoor", job: "Product Engineer", stage: "Interview" as EmployerPipelineStage },
];

export const employerSkillGaps = [
  { skill: "Accessibility", coverage: 42 },
  { skill: "System design", coverage: 58 },
  { skill: "SQL", coverage: 71 },
] as const;

export const employerAiQueries = [
  {
    id: "q1",
    query: "Find people with frontend accessibility expertise",
    result:
      "Matches: Meera Iyer — Accessibility evidence on profile; assessment checklist completed.",
  },
  {
    id: "q2",
    query: "Who shows strong API design practice patterns?",
    result:
      "Matches: Rohan Shah — API scenario assessment draft present.",
  },
] as const;

export const employerTeamSeats = [
  { id: "s1", name: "Anika Rao", role: "Recruiter", active: true },
  { id: "s2", name: "Dev Patel", role: "Company Reviewer", active: true },
  { id: "s3", name: "Samir Khan", role: "Company Admin", active: false },
] as const;
