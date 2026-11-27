import buildReleasePublicationPlan from "./plan.mjs";
import verifyReleasePublicationWorkflow from "./workflow.mjs";

export default function verifyReleasePublicationWorkflowPlan(options) {
  const plan = buildReleasePublicationPlan(options.publication);
  verifyReleasePublicationWorkflow({
    targets: plan.targets,
    publicationRuns: options.publicationRuns,
    repo: options.repo,
    tag: options.tag,
    log: options.log,
  });
  return plan;
}
