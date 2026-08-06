# Release Notes

## 1.1.17

- Added `tagit --version` and `tagit -v` commands.
- Version queries now report the installed package version without starting a release.
- Preserved the existing automated dependency, test, build, commit, and tag workflow.

## 1.1.16

- Added an initial `npm install` step before dependency updates.
- Added automatic `npm outdated --json` inspection.
- Outdated npm dependencies are upgraded to their `@latest` versions.
- Existing `npm update`, test, and build verification steps remain enabled.
