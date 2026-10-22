import { shouldNormalizeCompletedWorkflowJob } from "../../../../../src/github/runs/release/job/normalization-policy.mjs";

const passedWorkflow = { status: "completed", conclusion: "success" };
const staleJob = { status: "in_progress", conclusion: null };

test("allows normalization only after a successful workflow completes", () => {
  expect(shouldNormalizeCompletedWorkflowJob(staleJob, passedWorkflow)).toBe(true);
  expect(shouldNormalizeCompletedWorkflowJob(staleJob, { status: "in_progress" })).toBe(false);
  expect(
    shouldNormalizeCompletedWorkflowJob(staleJob, { status: "completed", conclusion: "failure" }),
  ).toBe(false);
});

test("does not normalize a completed job that already has a conclusion", () => {
  expect(
    shouldNormalizeCompletedWorkflowJob(
      { status: "completed", conclusion: "success" },
      passedWorkflow,
    ),
  ).toBe(false);
});
