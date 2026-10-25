import { addWorkflowRunnerLabels } from "../../../../../src/github/runs/release/job/workflow-labels.mjs";

test("adds workflow labels only when a job has no direct labels", () => {
  const jobs = [{ name: "validate" }, { name: "publish", labels: ["windows-latest"] }];
  expect(addWorkflowRunnerLabels(jobs, { validate: ["ubuntu-latest"] })).toEqual([
    { name: "validate", labels: ["ubuntu-latest"] },
    { name: "publish", labels: ["windows-latest"] },
  ]);
  expect(jobs[0]).not.toHaveProperty("labels");
});

test("uses no workflow labels when the job name has no metadata", () => {
  expect(addWorkflowRunnerLabels([{ name: "validate" }])).toEqual([
    { name: "validate", labels: [] },
  ]);
});
