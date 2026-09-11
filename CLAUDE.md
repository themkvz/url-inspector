# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

URL Inspector — break down, edit, and rebuild URLs without losing the details.

Hard constraints (apply to every change):

- **Minimal, bundled, self-hosted dependencies.** No dependency-free requirement, but every runtime dependency must be bundled into the static build (no CDN loads) and a new one needs explicit user approval. Prefer platform APIs (`URL`, `URLSearchParams`, native form controls, CSS) first.
- **Client-only.** Everything runs in the browser. No backend, no network calls made on the user's URLs.
- **Anonymous.** No analytics, tracking, cookies, accounts, third-party scripts/fonts/CDNs, or telemetry. Inspected URLs never leave the device.
- **Minimal.** Smallest implementation that satisfies the spec.
- **Lossless.** Round-tripping a URL (parse → edit → rebuild) must preserve details: encoding, parameter order, duplicate keys, empty values, fragments.

## Stack

Bun is the single tool: package manager, dev server, bundler, and test runner.

- Runtime: Preact + `@preact/signals`, Pico CSS (all bundled, self-hosted, no CDN).
- Dev tooling: TypeScript (strict), Biome (lint + format), lefthook (pre-commit runs Biome + `tsc --noEmit`).
- Layout: `index.html` entry → `src/main.tsx` (mounts) → `src/app.tsx` (shell). Path alias `@/*` → `src/*`.

## Commands

- `bun run dev` — dev server with HMR at `http://localhost:3000`.
- `bun run build` — static production build to `dist/`.
- `bun test` — runs tests, including the privacy check that scans `dist/` for external resource references.
- `bun run check` — Biome check + `tsc --noEmit`.

## Workflow: OpenSpec (spec-driven development)

Work is driven by OpenSpec (`openspec` CLI is installed globally; schema `spec-driven`).

- `openspec/specs/` — current source-of-truth capability specs.
- `openspec/changes/<change>/` — in-flight change proposals (proposal, design, tasks, spec deltas).
- `openspec/changes/archive/` — completed changes.
- `openspec/config.yaml` — project context and per-artifact rules (currently unset).

Lifecycle: propose → apply (implement tasks) → sync specs → archive. Implement only what the active change's tasks specify; don't add scope outside the change.

Workflow skills live in `.agents/skills/openspec-*` (propose, explore, apply-change, update-change, sync-specs, archive-change). They are generated for Codex (`.openspec-target`), so Claude Code does not auto-load them — read the relevant `SKILL.md` directly when running an OpenSpec step.
