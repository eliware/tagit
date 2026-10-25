export function selectReleaseRunBranches(tag, workflowPath = ".github/workflows/ci.yaml") {
  const publicationWorkflows = [".github/workflows/npm.yaml", ".github/workflows/ghcr.yaml"];
  return publicationWorkflows.includes(workflowPath)
    ? [tag, `refs/tags/${tag}`]
    : ["main", tag, `refs/tags/${tag}`];
}
