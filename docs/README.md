# tagit user guides

Use these guides to install tagit, check a repository, and run a release.

## Guides

- Read [requirements](requirements.md) before you install tagit or check a repository.
- Read [commands](commands.md) for command names, options, results, and exit codes.
- Read [operations](operations.md) for the owner and DevOps release process.

## Scope

Run tagit from the root of the repository that you want to check. Tagit checks release readiness and publication. It does not deploy applications or edit GitOps repositories.

Tagit relies on the installed `@eliware/test` package for repository convention checks. Tagit also checks Git state and the required GitHub Actions results for the current commit or release tag.
