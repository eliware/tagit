export function releaseGuide() {
  return [
    "Release checklist:",
    "- Complete the owner handoff.",
    "- Confirm that Eliware Operations approved the exact version.",
    "- Run tagit preflight without waivers.",
    "- Set package.json to the requested version.",
    "- Run tagit release --version X.Y.Z.",
    "- TagIt creates an empty release commit after preflight and pushes both refs atomically.",
    "- TagIt reports links after the CI and applicable publication workflows start.",
    "- Run tagit release-wait to check CI on the tagged commit.",
    "- When npm-published and npm.yaml apply, check npm publication.",
    "- When ghcr-published and ghcr.yaml apply, check GHCR publication.",
    "- Report a CI, npm, or GHCR failure and return a nonzero exit code.",
    "Do not rerun an interrupted release until you check local and remote tags.",
  ].join("\n");
}
