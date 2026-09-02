import type { PluginInput } from "@opencode-ai/plugin"
import { isHephaestusSupportedModel } from "../../agents/hephaestus"
import {
  getSessionAgent,
  resolveRegisteredAgentName,
  updateSessionAgent,
} from "../../features/claude-code-session-state"
import { log } from "../../shared"
import { getAgentConfigKey } from "../../shared/agent-display-names"

const TOAST_TITLE = "Unsupported Hephaestus Model"
const TOAST_MESSAGE = [
  "Hephaestus supports GPT-5.3 Codex, GPT-5.4, GPT-5.5, GPT-5.6, and GLM-5.3.",
  "For other models, use Sisyphus.",
].join("\n")
type NoHephaestusNonGptHookOptions = {
  allowNonGptModel?: boolean
}

function showToast(ctx: PluginInput, sessionID: string, variant: "error" | "warning"): void {
  ctx.client.tui.showToast({
    body: {
      title: TOAST_TITLE,
      message: TOAST_MESSAGE,
      variant,
      duration: 10000,
    },
  }).catch((error) => {
    log("[no-hephaestus-non-gpt] Failed to show toast", {
      sessionID,
      error,
    })
  })
}

export function createNoHephaestusNonGptHook(
  ctx: PluginInput,
  options?: NoHephaestusNonGptHookOptions,
) {
  return {
    "chat.message": async (input: {
      sessionID: string
      agent?: string
      model?: { providerID: string; modelID: string }
    }, output?: {
      message?: { agent?: string; [key: string]: unknown }
    }): Promise<void> => {
      const rawAgent = input.agent ?? getSessionAgent(input.sessionID) ?? ""
      const agentKey = getAgentConfigKey(rawAgent)
      const modelID = input.model?.modelID
      const allowNonGptModel = options?.allowNonGptModel === true

      if (agentKey === "hephaestus" && modelID && !isHephaestusSupportedModel(modelID)) {
        showToast(ctx, input.sessionID, allowNonGptModel ? "warning" : "error")
        if (allowNonGptModel) {
          return
        }
        input.agent = resolveRegisteredAgentName("sisyphus") ?? "sisyphus"
        if (output?.message) {
          output.message.agent = resolveRegisteredAgentName("sisyphus") ?? "sisyphus"
        }
        updateSessionAgent(input.sessionID, "sisyphus")
      }
    },
  }
}
