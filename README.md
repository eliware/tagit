# [![eliware.org](https://eliware.org/logos/brand.png)](https://discord.gg/M6aTR9eTwN)

## @eliware/tagit [![npm version](https://img.shields.io/npm/v/@eliware/tagit.svg)](https://www.npmjs.com/package/@eliware/tagit) [![license](https://img.shields.io/github/license/eliware/tagit.svg)](LICENSE) [![build status](https://github.com/eliware/tagit/actions/workflows/nodejs.yml/badge.svg)](https://github.com/eliware/tagit/actions)

Automated version selection, dependency updates, builds, and Git release operations for Node.js and PHP projects.

`tagit` supports Node.js projects on Windows and Linux. Composer releases
still require a Composer installation and may require platform-specific
configuration.

---

## What is tagit?

`tagit` automates the Eliware release workflow for Node.js projects. It verifies local gates and successful Ubuntu and Windows CI for the exact commit, updates the explicitly requested version, commits the result, creates a Git tag, and pushes the commit and tag to the configured remote.

## Features

- Increments the final numeric version segment in `package.json` and/or `composer.json`
- Keeps `package.json` and `composer.json` versions in sync when both files exist
- Runs Composer maintenance commands for PHP projects
- Runs `npm update` for Node.js projects
- Detects webpack projects and runs a build before committing
- Commits all changes with a message like `Version <version> - MM-DD-YYYY`
- Tags the commit with the new version prefixed by `v`, for example `v1.2.4`
- Pushes commits and tags to your remote repository
- Logs each step for transparency

## Requirements

- Windows or Linux
- Node.js 26 or newer
- npm
- Git
- Composer, if the target project contains `composer.json`
- A correctly configured Git repository with push access to its remote

## How versioning works

`tagit` requires an explicit target version and never auto-increments versions:

```text
1.2.3 -> 1.2.4
```

When both version files are present, `composer.json` is used as the source version. The resulting new version is then written to both `composer.json` and `package.json`.

If only `package.json` exists, that file is used as the source version.

If only `composer.json` exists, that file is used as the source version.

Each detected version file must contain a `version` field.

## Installation

Clone the repository (suggested location: `/opt`):

```bash
sudo git clone https://github.com/eliware/tagit.git /opt/tagit
cd /opt/tagit
sudo npm install
# (Optional) Run tests
sudo npm test
```

Create a symlink to make `tagit` available system-wide:

```bash
sudo ln -s /opt/tagit/bin/tagit.mjs /usr/bin/tagit
```

## Usage

Switch to the root directory of the project you want to release. Run the
read-only preflight first:

```bash
tagit preflight
```

After preflight passes and the owner authorizes the exact version, release it:

```bash
tagit release --version 2.0.0
```

These are the only operational commands. Use `tagit --help` for usage.

The preflight rejects dirty trees, checks for `.notag`, runs tests with strict
100x4 coverage, lint, audit, and package validation, and verifies successful
Ubuntu and Windows CI for the exact current commit. There is no coverage
waiver or dry-run release path.

GitHub Actions monitoring remains available as a library capability and will be
integrated into the release orchestration separately. The current check and
dry-run commands do not modify GitHub, GitOps, or production state.

Update a declared GitOps image pin after CI has published and verified an image:

```bash
npm run gitops:pin -- --dry-run \
  --gitops-root /opt/gitops-k8s \
  --source eliware/ask \
  --version 1.1.7 \
  --digest sha256:<64-hex-digest>
```

Remove `--dry-run` only after reviewing the result. The updater requires an
explicit registry mapping, writes `vX.Y.Z@sha256:...`, validates the declared
Kustomize overlay, and refuses missing or unsafe mappings. It does not commit,
push, sync Argo, or roll back deployments yet.

If you have not created the symlink, you can run it directly with:

```bash
<tagit-root>/bin/tagit.mjs release --version 2.0.0
```

## Release flow

When run from a target project, `tagit` performs these steps:

1. Stops immediately if a `.notag` file exists in the current directory.
2. Requires and writes the explicitly selected version to `composer.json` and/or `package.json`.
3. If `composer.json` exists, runs:

```bash
COMPOSER_HOME="." COMPOSER_ALLOW_SUPERUSER=1 composer update
COMPOSER_HOME="." COMPOSER_ALLOW_SUPERUSER=1 composer bump
```

4. If `package.json` exists, runs:

```bash
npm update
```

5. If `package.json` contains a `test` script, runs:

```bash
npm test
```

6. If webpack is detected, runs the first available build command:

```bash
npm run build
npm run webpack
npx webpack
```

7. Stages all changes, commits, tags, and pushes:

```bash
git add -A
git commit -m 'Version <version> - MM-DD-YYYY'
git tag v<version>
git push
git push --tags
```

Webpack is detected when the project has a `webpack` dependency in `dependencies`, `devDependencies`, `peerDependencies`, or `optionalDependencies`, or when `webpack.config.js` / `webpack.config.mjs` exists.

## Skipping a release

Create a `.notag` file in the target project root to prevent `tagit` from making any changes:

```bash
touch .notag
```

Remove the file when releases should be allowed again.

## Testing

Run the test suite with:

```bash
npm test
```

Run the linter with:

```bash
npm run lint
```

## Notes

- `tagit` runs npm dependency maintenance, so dependency lock files may change during a release.
- If `npm update`, `npm test`, `npm run build`, or Composer update/bump fails, `tagit` restores the version-file snapshots captured before dependency/test/build/Git commands.
- `tagit` commits every staged and unstaged change after running `git add -A`.
- The GitHub Actions workflow publishes to npm only when a `v*` tag is pushed.

## Support

For help or questions, join the community and chat with the author:

[![Discord](https://eliware.org/logos/discord_96.png)](https://discord.gg/M6aTR9eTwN)  
**[eliware.org on Discord](https://discord.gg/M6aTR9eTwN)**

## License

[MIT © 2025 Eli Sterling, eliware.org](LICENSE)

## Links

- [Home Page](https://eliware.org)
- [GitHub Repo](https://github.com/eliware/tagit)
- [GitHub Org](https://github.com/eliware)
- [GitHub Personal](https://github.com/eli-sterling)
- [Discord](https://discord.gg/M6aTR9eTwN)
