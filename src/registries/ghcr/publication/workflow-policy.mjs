export function hasGhcrPublicationWorkflow(fs) {
  return fs.existsSync(".github/workflows/ghcr.yaml");
}
