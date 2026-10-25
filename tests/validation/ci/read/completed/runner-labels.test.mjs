import { addCompletedRunRunnerLabels } from "../../../../../src/validation/ci/read/completed/runner-labels.mjs";

test("adds runner labels to copied job records", () => {
  const jobs = [{ name: "validate", status: "completed" }, { name: "publish" }];
  expect(addCompletedRunRunnerLabels(jobs, { validate: ["ubuntu-latest"] })).toEqual([
    { name: "validate", status: "completed", labels: ["ubuntu-latest"] },
    { name: "publish", labels: [] },
  ]);
  expect(jobs).toEqual([{ name: "validate", status: "completed" }, { name: "publish" }]);
});

test("uses an empty label map when none is supplied", () => {
  expect(addCompletedRunRunnerLabels([{ name: "validate" }])).toEqual([
    { name: "validate", labels: [] },
  ]);
});
