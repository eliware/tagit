import { enforceReleaseJobPolicy } from "../../../../../src/github/runs/release/job/acceptance-policy.mjs";

const ubuntu = { name: "test", status: "completed", conclusion: "success" };

test("accepts a passing Ubuntu job and returns the Windows jobs", () => {
  expect(
    enforceReleaseJobPolicy([ubuntu], { ubuntuJobs: [ubuntu], windowsJobs: [] }),
  ).toMatchObject({ windowsJobs: [] });
});

test("rejects failed general job records", () => {
  const failed = { name: "publish", status: "completed", conclusion: "failure" };
  expect(() =>
    enforceReleaseJobPolicy([ubuntu, failed], { ubuntuJobs: [ubuntu], windowsJobs: [] }),
  ).toThrow("publish: failure");
});

test("rejects missing passing Ubuntu evidence", () => {
  expect(() => enforceReleaseJobPolicy([ubuntu], { ubuntuJobs: [], windowsJobs: [] })).toThrow(
    "Ubuntu",
  );
});
