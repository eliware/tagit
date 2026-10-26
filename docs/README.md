# tagit user guides

Use these guides to set up a target, check release readiness, and verify a release.

## Start here

1. Read the requirements guide before you install tagit.
2. Configure the target repository to satisfy those requirements.
3. Run `tagit preflight` from the target repository root.
4. Follow the operations guide to prepare a release and request release approval.
5. Read the command guide for command results and options.

## Guides

- Read [requirements](requirements.md) before you install tagit or check a repository.
- Read [commands](commands.md) for command names, options, results, and exit codes.
- Read [operations](operations.md) for the owner handoff and DevOps release process.
- Read [troubleshooting](troubleshooting.md) to resolve common setup and check failures.

## Scope

Run tagit from the root of the repository that you want to check. Tagit supports packages, workspaces, infrastructure, documentation, and applications that do not publish packages.

Each target needs `package.json`, `@eliware/test` as a development dependency, and an `npm test` script that runs `eliware-test`. Each target also needs `.github/workflows/ci.yaml`. Publication workflows are optional.

Tagit checks release readiness and applicable publication. It does not deploy applications or edit GitOps repositories. A workflow link from `tagit release` means that the workflow started. It does not mean that the workflow passed.

Tagit relies on the installed `@eliware/test` package for repository convention checks. Tagit also checks Git state and GitHub Actions results for the exact commit or release tag.
