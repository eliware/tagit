export function selectReleaseRunBranches(tag, workflowPath) {
  const publicationWorkflows = [".github/workflows/npm.yaml", ".github/workflows/ghcr.yaml"];
  return publicationWorkflows.includes(workflowPath)
    ? [tag, `refs/tags/${tag}`]
    : ["main", tag, `refs/tags/${tag}`];
}
