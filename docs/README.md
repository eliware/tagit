# tagit user guides

Use these guides to install tagit, check a repository, and run a release.

## Guides

- Read [requirements](requirements.md) before you install tagit or check a repository.
- Read [commands](commands.md) for command names, options, results, and exit codes.
- Read [operations](operations.md) for the owner handoff and DevOps release process.
- Read [troubleshooting](troubleshooting.md) to resolve common setup and check failures.

## Scope

Run tagit from the root of the repository that you want to check. Tagit supports packages, workspaces, infrastructure repositories, documentation repositories, and applications that do not publish packages.

Each target needs `package.json`, `@eliware/test`, an `npm test` script that runs `eliware-test`, and the required CI workflow. A publication workflow is optional.

Tagit checks release readiness and applicable publication. It does not deploy applications or edit GitOps repositories.

Tagit relies on the installed `@eliware/test` package for repository convention checks. Tagit also checks Git state and GitHub Actions results for the exact current commit or release tag.
