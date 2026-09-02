# GLM OpenAgent MVP QA

## What was tested

This evidence covers the OpenCode-only personal GLM preset from the installer boundary through the real OpenCode harness:

1. Focused failing-first tests for GLM-5.3 capability metadata, GLM-aware prompts, Hephaestus support, the Z.ai-only routing catalog, and `--preset=glm` argument resolution.
2. Package typechecks, the consolidated affected test suite under the normal repository preload, direct bundles for the OpenCode plugin and CLI, and whitespace validation.
3. The built CLI running `install --preset=glm --skip-auth` inside an isolated HOME, USERPROFILE, XDG, OpenCode config, application-data, and cache tree.
4. OpenCode 1.14.23 loading the source plugin and completing default Sisyphus plus explicit Hephaestus runs through a local OpenAI-compatible mock.
5. Read-only before/after checks against the real user OpenCode config and session database.

## What was observed

- The post-rebase affected suite passed 253 tests with 593 assertions under the normal repository preload. The earlier pre-rebase selection passed 244 tests with 554 assertions.
- The complete root workspace typecheck and both changed-package typechecks succeeded. Direct Bun bundles of the plugin entry and CLI entry also succeeded.
- The installer generated 11 canonical agent routes and 8 canonical category routes using only `zai-coding-plan/glm-5.3` and `zai-coding-plan/glm-5.3-flash`. It generated no foreign-provider routes and no fallback models.
- Default Sisyphus returned exactly `TUI_NOREG_OK` through GLM-5.3.
- Explicit `Hephaestus - Deep Agent` returned exactly `TUI_NOREG_OK`. The isolated SQLite session records both its user and assistant messages as Hephaestus on provider `zai-coding-plan` and model `glm-5.3`, proving the non-GPT guard did not reroute the agent.
- The real user config SHA256, real session database SHA256, and real session count were unchanged. No real user-level OMO config appeared.
- The owned mock process was stopped, and its port no longer listened.

Exact sanitized receipts are in:

- `automated-gates.txt`
- `generated-routing.json`
- `runtime-session-proof.json`
- `isolation-proof.txt`
- `mock-server.log`
- `root-build-limitation.txt`
- `root-test-limitation.txt`

## Why this is enough

The tests pin the machine-consumed capability, routing, and installer contracts. The isolated install proves the user-facing preset produces the intended complete configuration. The two real `opencode run --format json` sessions prove that OpenCode can load this plugin, resolve the generated provider/model route, and execute both the default agent and the newly supported GLM Hephaestus path. The SQLite receipt proves the successful Hephaestus run was not silently switched by the chat hook. The unchanged real config and database receipts prove isolation. The post-rebase suite confirms the newer Codex-only upstream commits did not affect this OpenCode feature.

## What was omitted

Raw environment dumps, authentication values, local absolute paths, and the full injected AGENTS.md prompt were intentionally omitted. The mock used a non-secret placeholder key. The artifacts retain commands, exit states, model routes, session identifiers, and observable output needed for review.

## Residual risk

The live Z.ai service and a real paid account were not contacted; provider transport was exercised through a local OpenAI-compatible endpoint. The repository-wide `bun run build` could not finish because an unrelated nested shared-skill submodule could not be materialized in this Windows environment. The root `bun test` also encountered unrelated build-fixture, Bun-version, sandbox-cache, and platform timing failures before Bun 1.3.9 crashed. The complete root typecheck, direct affected builds, and affected tests passed. Both limitations are recorded separately for clean Linux CI comparison.
