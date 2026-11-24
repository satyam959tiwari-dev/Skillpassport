/**
 * Content access layer.
 * UI components should import through here so future API integration
 * can swap implementations without rewriting pages.
 */
export { audiences, getAudience } from "@/data/audiences";
export {
  candidateJourneySteps,
  candidateDocumentSamples,
  candidateAssessmentCatalog,
  candidateJobSamples,
} from "@/data/candidates";
export { faqs } from "@/data/faqs";
export {
  platformFeatures,
  trustPrinciples,
  productExperiences,
  problemPoints,
} from "@/data/features";
export {
  aiCapabilities,
  aiPrinciples,
  aiCorePrinciple,
  aiBoundaries,
  notGenerativeAi,
  aiDemos,
  aiShowcase,
} from "@/data/ai";
export type { AiShowcaseRole } from "@/data/ai";
export {
  howItWorks,
  valuePillars,
  ecosystemAudiences,
  ecosystemConnections,
} from "@/data/workflows";
export {
  primaryNav,
  footerSolutions,
  footerPlatform,
  appLinks,
} from "@/data/navigation";
export {
  platformStatistics,
  statisticsDisclaimer,
} from "@/data/statistics";
export { pageMeta, siteName, siteTagline, siteUrl, contactTopics } from "@/data/pages";
export {
  simulateAiDemo,
  getAiDemoById,
  validateContact,
  submitContactDemo,
} from "@/data/mock-responses";
