import readWorkflowJobLabelEntries from "./identities.mjs";
import mergeWorkflowRunnerLabelEntries from "./merge.mjs";

export default function mapWorkflowJobRunnerLabels(jobs) {
  return mergeWorkflowRunnerLabelEntries(readWorkflowJobLabelEntries(jobs));
}
