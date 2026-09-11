# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

URL Inspector — break down, edit, and rebuild URLs without losing the details.

Hard constraints (apply to every change):

- **Dependency-free.** No runtime or build dependencies unless the user explicitly approves one. Prefer platform APIs (`URL`, `URLSearchParams`, native form controls, CSS).
- **Client-only.** Everything runs in the browser. No backend, no network calls made on the user's URLs.
- **Anonymous.** No analytics, tracking, cookies, accounts, third-party scripts/fonts/CDNs, or telemetry. Inspected URLs never leave the device.
- **Minimal.** Smallest implementation that satisfies the spec.
- **Lossless.** Round-tripping a URL (parse → edit → rebuild) must preserve details: encoding, parameter order, duplicate keys, empty values, fragments.

## Status

Greenfield — no source code, build, or test tooling yet. Update this file with commands and architecture once the first OpenSpec change is implemented.

## Workflow: OpenSpec (spec-driven development)

Work is driven by OpenSpec (`openspec` CLI is installed globally; schema `spec-driven`).

- `openspec/specs/` — current source-of-truth capability specs.
- `openspec/changes/<change>/` — in-flight change proposals (proposal, design, tasks, spec deltas).
- `openspec/changes/archive/` — completed changes.
- `openspec/config.yaml` — project context and per-artifact rules (currently unset).

Lifecycle: propose → apply (implement tasks) → sync specs → archive. Implement only what the active change's tasks specify; don't add scope outside the change.

Workflow skills live in `.agents/skills/openspec-*` (propose, explore, apply-change, update-change, sync-specs, archive-change). They are generated for Codex (`.openspec-target`), so Claude Code does not auto-load them — read the relevant `SKILL.md` directly when running an OpenSpec step.
