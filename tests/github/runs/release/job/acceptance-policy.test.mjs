import { enforceReleaseJobPolicy } from "../../../../../src/github/runs/release/job/acceptance-policy.mjs";

const ubuntu = { name: "test", status: "completed", conclusion: "success" };

test("accepts a passing Ubuntu job and returns the Windows jobs", () => {
  const windows = { name: "windows", status: "completed", conclusion: "success" };
  expect(
    enforceReleaseJobPolicy([ubuntu, windows], { ubuntuJobs: [ubuntu], windowsJobs: [windows] }),
  ).toMatchObject({ windowsJobs: [windows] });
});

test("rejects a failed Windows job before general job failures", () => {
  const windows = { name: "windows", status: "completed", conclusion: "failure" };
  expect(() =>
    enforceReleaseJobPolicy([ubuntu, windows], { ubuntuJobs: [ubuntu], windowsJobs: [windows] }),
  ).toThrow("failing Windows");
});

test("rejects failed non-platform jobs and missing passing Ubuntu evidence", () => {
  const failed = { name: "publish", status: "completed", conclusion: "failure" };
  expect(() =>
    enforceReleaseJobPolicy([ubuntu, failed], { ubuntuJobs: [ubuntu], windowsJobs: [] }),
  ).toThrow("publish: failure");
  expect(() => enforceReleaseJobPolicy([ubuntu], { ubuntuJobs: [], windowsJobs: [] })).toThrow(
    "Ubuntu",
  );
});
