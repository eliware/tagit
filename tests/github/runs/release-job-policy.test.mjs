import { verifyReleaseJobs } from "../../../src/github/runs/release-job-policy.mjs";

test("accepts successful Ubuntu and optional Windows jobs", () => {
  const result = verifyReleaseJobs([
    { name: "test", labels: ["ubuntu-latest"], status: "completed", conclusion: "success" },
    { name: "test", labels: ["windows-latest"], status: "completed", conclusion: "success" },
  ]);
  expect(result.windowsJobs).toHaveLength(1);
});

test("classifies neutral validation job names from the release workflow runner", () => {
  const result = verifyReleaseJobs(
    [
      { name: "validate", status: "completed", conclusion: "success" },
      { name: "publish", status: "completed", conclusion: "success" },
    ],
    { validate: ["ubuntu"], publish: ["ubuntu"] },
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
