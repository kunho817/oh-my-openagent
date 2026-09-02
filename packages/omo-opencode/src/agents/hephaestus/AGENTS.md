---
name: hephaestus-agent
description: Developer reference for the Hephaestus autonomous deep worker agent — GPT and GLM model variants, key behaviors, and delegation patterns.
---

# src/agents/hephaestus/ -- Autonomous Deep Worker

**Generated:** 2026-08-10 / 38d268995

## OVERVIEW

6 source files (+4 co-located tests). Hephaestus agent -- autonomous deep worker with GPT-5.4, GPT-5.5, GPT-5.6, GLM-5.3, and base-prompt variants. Goal-oriented: give it objectives, not step-by-step instructions. "The Legitimate Craftsman."

## FILES

| File | Purpose |
|------|---------|
| `agent.ts` | `createHephaestusAgent()` factory, model-variant routing |
| `gpt.ts` | Base GPT prompt: discipline rules, delegation, verification |
| `gpt-5-6.ts` | GPT-5.6-native outcome-first prompt |
| `gpt-5-5.ts` | GPT-5.5-native prompt with task discipline sections |
| `gpt-5-4.ts` | GPT-5.4-native prompt with XML-tagged blocks, entropy-reduced |
| `index.ts` | Barrel exports |

## KEY BEHAVIORS

- Mode: `primary` (respects UI model selection)
- Requires an explicitly configured supported GPT or GLM provider (no fallback chain)
- NEVER trusts subagent self-reports -- always verifies
- NEVER uses `background_cancel(all=true)`
- Delegates exploration to background agents, never sequential
- Uses `run_in_background=true` for explore/librarian

## MODEL VARIANTS

| Model | Prompt Source | Optimizations |
|-------|-------------|---------------|
| gpt-5.6 | `gpt-5-6.ts` | Outcome-first, manual-QA-focused prompt |
| gpt-5.5 | `gpt-5-5.ts` | Task discipline prompt |
| gpt-5.4 | `gpt-5-4.ts` | XML-tagged blocks, 8 sections |
| gpt-5.3-codex | `gpt.ts` | Base prompt (`GPT_5_3_CODEX_RE`) |
| glm-5.3 | `gpt-5-6.ts` | Shared outcome-first prompt with GLM-5.3 identity and max reasoning |

Only GPT-5.3 Codex / 5.4 / 5.5 / 5.6 and GLM-5.3 are supported. Anything else - generic GPT (`gpt-4o`), an unsupported 5.x, another non-GPT model, or no model - throws `UnsupportedHephaestusModelError`. `HephaestusPromptSource` also includes `"glm-5-3"`.

`extractModelName()` strips hosted vendor/region prefixes via `HOSTED_VENDOR_PREFIX_RE`, so Bedrock-style ids like `amazon-bedrock/us.openai.gpt-5.4` still route correctly.

`getHephaestusPrompt(model, useTaskSystem = false)` / `createHephaestusAgent(..., useTaskSystem = false)`: `true` emits Task Discipline (`task_create`/`task_update`), `false` emits Todo Discipline (`todowrite`).
