export function releaseGuide() {
  return `Release checklist (all required):
- Owner pre-release handoff is complete and the exact version is authorized.
- tagit preflight passes without waivers.
- The release version is explicit: tagit release --version X.Y.Z.
- package.json already contains the requested version; Tagit does not rewrite files or create commits.
- Tagit creates/reuses vX.Y.Z and pushes only the tag.
- Verify the remote commit and tag point to the expected SHAs.
- Verify the tag workflow's Ubuntu and publish jobs individually; Windows is optional but must pass when present.
- Verify the exact package version and dist-tag in its target registry.
- tagit release-wait verifies the latest tag's CI and publication; N/A registries are reported as skipped.
- Any CI, publish, npm, or GHCR failure is reported and exits nonzero.
Never rerun an interrupted release blindly or bypass a failed gate.`;
}
