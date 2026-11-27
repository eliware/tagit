import successfulRun from "../../../../src/validation/ci/select/successful-run.mjs";

test("identifies successful completed runs", () => {
  const run = { status: "completed", conclusion: "success" };
  expect(successfulRun(run)).toBe(run);
  expect(successfulRun({ status: "in_progress", conclusion: "" })).toBeNull();
});
