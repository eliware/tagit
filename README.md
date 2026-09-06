# [![eliware.org](https://eliware.org/logos/brand.png)](https://discord.gg/M6aTR9eTwN)

## @eliware/tagit [![npm](https://img.shields.io/npm/v/@eliware/tagit)](https://www.npmjs.com/package/@eliware/tagit) [![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE) [![CI](https://github.com/eliware/tagit/actions/workflows/nodejs.yml/badge.svg)](https://github.com/eliware/tagit/actions/workflows/nodejs.yml)

TagIt is deterministic release preflight and publication verification for
Eliware packages. It reports changes, validates repository readiness, pushes already
committed work, creates release tags for DevOps, and verifies CI and registry
publication.

TagIt does not authenticate operator roles, deploy applications, modify GitOps,
rewrite package metadata, or publish without the authorized release flow.

## Requirements

- Node.js 26 or newer
- Git and, for CI inspection, the GitHub CLI (`gh`)
- A target repository with the required files and the shared `@eliware/test`
  development harness

## Installation

Install globally:

```text
npm install --global @eliware/tagit
```

Or run it without a global installation:

```text
npx --yes @eliware/tagit --help
```

## Usage

From the target repository root, project owners run:

```text
tagit notes
tagit preflight
tagit push
```

The canonical [owner workflow example](examples/owner-workflow.md) shows the
safe handoff sequence. Owners do not run `tagit release` or
`tagit release-wait`; DevOps runs those after the exact-commit preflight
handoff.

## Configuration

TagIt has no required application-specific environment variables. The optional
`LOG_LEVEL` override controls shared logger verbosity; see [.env.example](.env.example).
GitHub CLI and npm must separately be authenticated/configured for operations
that inspect CI or verify publication. Do not
place credentials or production values in environment files.

## Security

TagIt does not collect credentials or authenticate operator roles. Keep tokens
out of source files and environment files; use the GitHub CLI and npm's normal
credential handling for authenticated operations.

## Validation and troubleshooting

TagIt’s own development checks are:

```text
npm test
npm run lint
npm run typecheck
npm audit --omit=dev --audit-level=moderate
npm pack --dry-run
```

For target repositories, `tagit preflight` invokes the declared `npm test`
command and verifies repository state, package metadata, exact-HEAD CI, and
required workflow policy. It does not duplicate checks owned by `@eliware/test`.
Missing, stale, failed, or mismatched CI evidence blocks the handoff.

## Documentation

- [Specifications overview](specs/overview.md)
- [Commands](specs/commands.md)
- [Release workflow](specs/release-workflow.md)
- [Validation](specs/validation.md)
- [Operations](docs/operations.md)
- [Release notes](RELEASE_NOTES.md)

## Support

For help, open an issue in the repository or use [Eliware Discord
support](https://discord.gg/M6aTR9eTwN).

## License

[MIT](LICENSE)
