import type { AgentConfig, CategoryConfig, GeneratedOmoConfig, ProviderAvailability } from "./model-fallback-types"

const ZAI_ONLY_AGENT_OVERRIDES: Record<string, AgentConfig> = {
  sisyphus: { model: "zai-coding-plan/glm-5.3", variant: "max" },
  hephaestus: { model: "zai-coding-plan/glm-5.3", variant: "max" },
  oracle: { model: "zai-coding-plan/glm-5.3", variant: "max" },
  librarian: { model: "zai-coding-plan/glm-5.3-flash", variant: "low" },
  explore: { model: "zai-coding-plan/glm-5.3-flash", variant: "low" },
  "multimodal-looker": { model: "zai-coding-plan/glm-5.3-flash", variant: "max" },
  prometheus: { model: "zai-coding-plan/glm-5.3", variant: "max" },
  metis: { model: "zai-coding-plan/glm-5.3", variant: "high" },
  momus: { model: "zai-coding-plan/glm-5.3", variant: "max" },
  atlas: { model: "zai-coding-plan/glm-5.3", variant: "high" },
  "sisyphus-junior": { model: "zai-coding-plan/glm-5.3", variant: "high" },
}

const ZAI_ONLY_CATEGORY_OVERRIDES: Record<string, CategoryConfig> = {
  "visual-engineering": { model: "zai-coding-plan/glm-5.3-flash", variant: "max" },
  ultrabrain: { model: "zai-coding-plan/glm-5.3", variant: "max" },
  deep: { model: "zai-coding-plan/glm-5.3", variant: "max" },
  artistry: { model: "zai-coding-plan/glm-5.3-flash", variant: "max" },
  quick: { model: "zai-coding-plan/glm-5.3-flash", variant: "low" },
  "unspecified-low": { model: "zai-coding-plan/glm-5.3-flash", variant: "low" },
  "unspecified-high": { model: "zai-coding-plan/glm-5.3", variant: "max" },
  writing: { model: "zai-coding-plan/glm-5.3-flash", variant: "low" },
}

export function isZaiOnlyAvailability(availability: ProviderAvailability): boolean {
  return (
    availability.zai &&
    !availability.native.claude &&
    !availability.native.openai &&
    !availability.native.gemini &&
    !availability.opencodeGo &&
    !availability.opencodeZen &&
    !availability.copilot &&
    !availability.kimiForCoding &&
    !availability.bailianCodingPlan &&
    !availability.minimaxCnCodingPlan &&
    !availability.minimaxCodingPlan &&
    !availability.vercelAiGateway
  )
}

export function applyZaiOnlyModelCatalog(config: GeneratedOmoConfig): GeneratedOmoConfig {
  return {
    ...config,
    agents: {
      ...config.agents,
      ...ZAI_ONLY_AGENT_OVERRIDES,
    },
    categories: {
      ...config.categories,
      ...ZAI_ONLY_CATEGORY_OVERRIDES,
    },
  }
}
