import { describe, expect, test } from "bun:test"

import { generateModelConfig } from "./model-fallback"
import type { InstallConfig } from "./types"

function createZaiOnlyConfig(): InstallConfig {
  return {
    platform: "opencode",
    hasOpenCode: true,
    hasCodex: false,
    hasSenpi: false,
    codexAutonomous: false,
    hasClaude: false,
    isMax20: false,
    hasOpenAI: false,
    hasGemini: false,
    hasCopilot: false,
    hasOpencodeZen: false,
    hasZaiCodingPlan: true,
    hasKimiForCoding: false,
    hasOpencodeGo: false,
    hasBailianCodingPlan: false,
    hasMinimaxCnCodingPlan: false,
    hasMinimaxCodingPlan: false,
    hasVercelAiGateway: false,
  }
}

describe("generateModelConfig Z.ai-only model catalog", () => {
  test("routes every OMO agent to GLM 5.3 family models", () => {
    const result = generateModelConfig(createZaiOnlyConfig())

    expect(result.agents).toEqual({
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
    })
  })

  test("routes every OMO category to workload-appropriate GLM 5.3 models", () => {
    const result = generateModelConfig(createZaiOnlyConfig())

    expect(result.categories).toEqual({
      "visual-engineering": { model: "zai-coding-plan/glm-5.3-flash", variant: "max" },
      ultrabrain: { model: "zai-coding-plan/glm-5.3", variant: "max" },
      deep: { model: "zai-coding-plan/glm-5.3", variant: "max" },
      artistry: { model: "zai-coding-plan/glm-5.3-flash", variant: "max" },
      quick: { model: "zai-coding-plan/glm-5.3-flash", variant: "low" },
      "unspecified-low": { model: "zai-coding-plan/glm-5.3-flash", variant: "low" },
      "unspecified-high": { model: "zai-coding-plan/glm-5.3", variant: "max" },
      writing: { model: "zai-coding-plan/glm-5.3-flash", variant: "low" },
    })
  })

  test("keeps the GLM catalog scoped to Z.ai-only availability", () => {
    const mixedConfig = { ...createZaiOnlyConfig(), hasOpenAI: true }
    const result = generateModelConfig(mixedConfig)

    expect(result.agents?.hephaestus?.model).toBe("openai/gpt-5.6-sol")
    expect(result.categories?.quick?.model).not.toBe("zai-coding-plan/glm-5.3-flash")
  })
})
