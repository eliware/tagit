import { normalizeCompletedWorkflowJob } from "../../../../../src/github/runs/release/job/status.mjs";

const stale = {
  name: "validate",
  status: "in_progress",
  conclusion: null,
  steps: [{ name: "test", status: "completed", conclusion: "success" }],
};

test("normalizes a stale job after every step passes in a successful workflow", () => {
  expect(
    normalizeCompletedWorkflowJob(stale, { status: "completed", conclusion: "success" }),
  ).toMatchObject({ status: "completed", conclusion: "success" });
});

test("keeps stale jobs without a non-empty step list", () => {
  const success = { status: "completed", conclusion: "success" };
  expect(normalizeCompletedWorkflowJob({ ...stale, steps: undefined }, success)).toMatchObject({
    status: "in_progress",
  });
  expect(normalizeCompletedWorkflowJob({ ...stale, steps: [] }, success)).toMatchObject({
    status: "in_progress",
  });
});

test("keeps stale jobs when a step has not succeeded", () => {
  const success = { status: "completed", conclusion: "success" };
  expect(
    normalizeCompletedWorkflowJob(
      { ...stale, steps: [{ status: "in_progress", conclusion: null }] },
      success,
    ),
  ).toMatchObject({ status: "in_progress" });
  expect(
    normalizeCompletedWorkflowJob(
      { ...stale, steps: [{ status: "completed", conclusion: "failure" }] },
      success,
    ),
  ).toMatchObject({ status: "in_progress" });
});
