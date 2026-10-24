export async function pollReleaseWorkflows(poll, common, workflows) {
  const results = [];
  for (const workflow of workflows) {
    const run = await poll({
      ...common,
      workflowPath: workflow.workflowPath,
      workflowLabel: workflow.profile,
    });
    results.push({ workflow, run });
  }
  return results;
}
