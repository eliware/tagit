# @eliware/tagit

Tagit helps Eliware project teams prepare, validate, and coordinate releases
from the project repository.

It reports release notes, checks release readiness, pushes work that is already
committed, and helps DevOps verify a release after the project owner handoff.

## Quick start

Run these commands from the root of the project you are preparing:

```text
tagit notes
tagit preflight
tagit push
```

Project owners use those three commands. The DevOps team handles the release
and post-release verification after the owner handoff and successful preflight.

## Install

```text
npm install --global @eliware/tagit
```

Or run it without a global installation:

```text
npx --yes @eliware/tagit --help
```

## Learn the workflow

The complete behavior contract is in [the Tagit specifications](specs/overview.md).
Start with the [command specification](specs/commands.md), then read the
[release workflow](specs/release-workflow.md) and
[out-of-scope behavior](specs/out-of-scope.md).

## Support

For questions or help, visit [eliware.org on Discord](https://discord.gg/M6aTR9eTwN).

## License

[MIT](LICENSE)
