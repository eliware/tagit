import { hasAcceptedWorkflowJobStatus } from "../../../src/github/runs/job-status-policy.mjs";

test.each(["success", "skipped", "neutral"])("accepts completed %s jobs", (conclusion) => {
  expect(hasAcceptedWorkflowJobStatus({ status: "completed", conclusion })).toBe(true);
});

test.each([
  { status: "in_progress", conclusion: null },
  { status: "completed", conclusion: "failure" },
  { status: "completed", conclusion: "cancelled" },
])("rejects unaccepted job status %#", (job) => {
  expect(hasAcceptedWorkflowJobStatus(job)).toBe(false);
});
