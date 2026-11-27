export default function releaseGuide() {
  return [
    "Release checklist:",
    "- Complete the owner handoff.",
    "- Confirm that Eliware Operations approved the exact version.",
    "- Run tagit preflight.",
    "- Set package.json to the requested version.",
    "- Run tagit release --version X.Y.Z.",
    "- The tagit command creates an empty release commit after preflight and pushes both refs atomically.",
    "- The tagit command exits after it pushes both refs.",
    "- Run tagit release-wait to check CI and applicable publication workflows.",
    "- When npm-published and npm.yaml apply, check npm publication.",
    "- When ghcr-published and ghcr.yaml apply, check GHCR publication.",
    "- Report a CI, npm, or GHCR failure and return a nonzero exit code.",
    "Do not rerun an interrupted release until you check local and remote tags.",
  ].join("\n");
}
