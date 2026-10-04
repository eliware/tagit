# TagIt documentation

## Purpose

This index covers TagIt's user documentation for setup, commands, validation, and safe owner and DevOps workflows. The Docs, Test, and Operations repositories own shared requirements and canonical operating procedures.

## Scope

TagIt validates target repository readiness and exact-commit CI evidence. It does not implement target projects, publish packages, deploy applications, or authorize releases.

## Setup

Install TagIt from npm with Node.js 26. Git is required; GitHub CLI is required for CI inspection. Run commands from the target repository root.

## Usage

Project owners use `notes`, `preflight`, and `push`; DevOps owns `release` and `release-wait` after the required handoff. For help and support, use the project GitHub issues or Eliware Discord.

## Contents

- [Command guide](../docs/commands.md) — supported owner and DevOps commands.
- [Decomposition inventory](../docs/decomposition-inventory.md) — module responsibilities and test boundaries.
- [Operations](../docs/operations.md) — installation, configuration, and troubleshooting.
- [Behavior specifications](../docs/specifications/README.md) — indexes the user-facing behavior guides.
- [Specification: commands](../docs/specifications/commands.md).
- [Specification: GitOps](../docs/specifications/gitops.md).
- [Specification: out of scope](../docs/specifications/out-of-scope.md).
- [Specification: overview](../docs/specifications/overview.md).
- [Specification: release workflow](../docs/specifications/release-workflow.md).
- [Specification: requirements](../docs/specifications/requirements.md).
- [Specification: validation](../docs/specifications/validation.md).
