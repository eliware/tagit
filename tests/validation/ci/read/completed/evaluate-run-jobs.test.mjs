import { evaluateCompletedRunJobs } from "../../../../../src/validation/ci/read/completed/evaluate-run-jobs.mjs";

test("validates jobs and applies runner metadata before policy evaluation", () => {
  const data = {
    jobs: [
      { name: "ubuntu", status: "completed", conclusion: "success" },
      { name: "windows", status: "completed", conclusion: "success" },
    ],
  };
  expect(
    evaluateCompletedRunJobs(data, 10, { ubuntu: ["ubuntu-latest"], windows: ["windows-latest"] }),
  ).toMatchObject({
    failed: false,
    ubuntu: true,
    windows: { passed: true, successful: true },
  });
  expect(data.jobs.map((job) => job.labels)).toEqual([["ubuntu-latest"], ["windows-latest"]]);
});

test("uses empty runner metadata when no labels exist", () => {
  expect(
    evaluateCompletedRunJobs(
      { jobs: [{ name: "job", status: "completed", conclusion: "success" }] },
      10,
    ),
  ).toMatchObject({ ubuntu: false, windows: { passed: true, successful: false } });
});
