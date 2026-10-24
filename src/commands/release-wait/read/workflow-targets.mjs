export function buildPublicationWorkflowTargets(npmApplicable, ghcrApplicable) {
  const workflows = [];
  if (npmApplicable) workflows.push({ workflowPath: ".github/workflows/npm.yaml", profile: "npm" });
  if (ghcrApplicable)
    workflows.push({ workflowPath: ".github/workflows/ghcr.yaml", profile: "ghcr" });
  return workflows;
}
