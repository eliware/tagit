export function releaseGuide() {
  return `Release checklist:
- Owner pre-release handoff is complete and the exact version is authorized.
- tagit preflight passes without waivers.
- The release version is explicit: tagit release --version X.Y.Z.
- package.json contains the requested version.
- TagIt runs preflight, creates an empty release commit, creates vX.Y.Z, and pushes both refs atomically.
- TagIt reports links after the CI and publish workflows start.
- tagit release-wait checks CI on the tagged commit.
- When a publication profile and publish.yaml exist, release-wait checks the publish workflow and registry.
- Any CI, publish, npm, or GHCR failure is reported and exits nonzero.
Never rerun an interrupted release without checking the local and remote tags.`;
}
