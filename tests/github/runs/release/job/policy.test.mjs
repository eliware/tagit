import { verifyReleaseJobs } from "../../../../../src/github/runs/release/job/policy.mjs";

test("accepts successful Ubuntu and optional Windows jobs from labels and runner metadata", () => {
  const result = verifyReleaseJobs(
    [
      { name: "test", labels: ["ubuntu-latest"], status: "completed", conclusion: "success" },
      { name: "test", labels: ["windows-latest"], status: "completed", conclusion: "success" },
      { name: "validate", status: "completed", conclusion: "success" },
    ],
    { validate: ["ubuntu"] },
  );
  expect(result.windowsJobs).toHaveLength(1);
});

test("accepts successful steps when a completed workflow has stale job status", () => {
  const result = verifyReleaseJobs(
    [
      {
        name: "validate",
        labels: ["ubuntu-latest"],
        status: "in_progress",
        conclusion: null,
        steps: [
          { name: "checkout", status: "completed", conclusion: "success" },
          { name: "npm test", status: "completed", conclusion: "success" },
        ],
      },
    ],
    {},
    { status: "completed", conclusion: "success" },
  );
  expect(result.windowsJobs).toEqual([]);
});

test("rejects stale jobs when steps fail or the workflow is not successful", () => {
  const stale = {
    name: "validate",
    labels: ["ubuntu-latest"],
    status: "in_progress",
    conclusion: null,
    steps: [{ name: "npm test", status: "completed", conclusion: "failure" }],
  };
  expect(() =>
    verifyReleaseJobs([stale], {}, { status: "completed", conclusion: "success" }),
  ).toThrow("validate: ");
  expect(() =>
    verifyReleaseJobs(
      [{ ...stale, steps: [{ ...stale.steps[0], conclusion: "success" }] }],
      {},
      { status: "in_progress", conclusion: null },
    ),
  ).toThrow("validate: ");
});

test("classifies a prototype-named job from its workflow runner", () => {
  const runnerLabels = Object.create(null);
  runnerLabels["__proto__"] = ["ubuntu"];
  const result = verifyReleaseJobs(
    [{ name: "__proto__", status: "completed", conclusion: "success" }],
    runnerLabels,
  );
  expect(result.windowsJobs).toEqual([]);
});

test("rejects platform classification based on job names", () => {
  expect(() =>
    verifyReleaseJobs([{ name: "ubuntu", status: "completed", conclusion: "success" }]),
  ).toThrow("Ubuntu");
  expect(() =>
    verifyReleaseJobs([{ name: "windows", status: "completed", conclusion: "success" }]),
  ).toThrow("Ubuntu");
});

test("rejects failed Windows or missing Ubuntu jobs", () => {
  expect(() =>
    verifyReleaseJobs([
      { name: "test", labels: ["windows-latest"], status: "completed", conclusion: "failure" },
    ]),
  ).toThrow("failing Windows");
  expect(() =>
    verifyReleaseJobs([{ name: "security", status: "completed", conclusion: "success" }]),
  ).toThrow("Ubuntu");
});

test("reports a failed non-platform job", () => {
  expect(() =>
    verifyReleaseJobs([
      { name: "test", labels: ["ubuntu-latest"], status: "completed", conclusion: "success" },
      { name: "publish", status: "completed", conclusion: "failure" },
    ]),
  ).toThrow("publish: failure");
});
