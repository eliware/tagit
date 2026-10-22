export function selectReleaseRunnerWorkflowPaths(publication) {
  return [
    ".github/workflows/ci.yaml",
    ...publication.workflows.map(({ workflowPath }) => workflowPath),
  ];
}
