import { evaluateCompletedRunJobs } from "../../../../../src/validation/ci/read/completed/evaluate-run-jobs.mjs";

test("evaluates runner metadata without changing the input job records", () => {
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
  expect(data.jobs).toEqual([
    { name: "ubuntu", status: "completed", conclusion: "success" },
    { name: "windows", status: "completed", conclusion: "success" },
  ]);
});

test("uses empty runner metadata when no labels exist", () => {
  expect(
    evaluateCompletedRunJobs(
      { jobs: [{ name: "job", status: "completed", conclusion: "success" }] },
      10,
    ),
  ).toMatchObject({ ubuntu: false, windows: { passed: true, successful: false } });
});
