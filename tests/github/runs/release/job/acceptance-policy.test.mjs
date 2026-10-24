import { enforceReleaseJobPolicy } from "../../../../../src/github/runs/release/job/acceptance-policy.mjs";

test("accepts absent Windows jobs as optional", () => {
  const ubuntu = { name: "test", status: "completed", conclusion: "success" };
  expect(
    enforceReleaseJobPolicy([ubuntu], { ubuntuJobs: [ubuntu], windowsJobs: [] }),
  ).toMatchObject({ windowsJobs: [] });
});

test("rejects a failed Windows job", () => {
  const ubuntu = { name: "test", status: "completed", conclusion: "success" };
  const windows = { name: "windows", status: "completed", conclusion: "failure" };
  expect(() =>
    enforceReleaseJobPolicy([ubuntu, windows], { ubuntuJobs: [ubuntu], windowsJobs: [windows] }),
  ).toThrow("failing Windows");
});
