export function buildPublicationWorkflowTargets(npmWorkflow, ghcrApplicable) {
  const workflows = npmWorkflow ? [npmWorkflow] : [];
  if (ghcrApplicable)
    workflows.push({ workflowPath: ".github/workflows/ghcr.yaml", profile: "ghcr" });
  return workflows;
}
