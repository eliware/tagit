export async function pollReleaseWorkflows(poll, common, workflows) {
  return Promise.all(
    workflows.map(async (workflow) => {
      const run = await poll({
        ...common,
        workflowPath: workflow.workflowPath,
        workflowLabel: workflow.profile,
      });
      return { workflow, run };
    }),
  );
}
