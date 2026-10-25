import { enforceReleaseJobPolicy } from "../../../../../src/github/runs/release/job/acceptance-policy.mjs";

test("accepts absent Windows jobs as optional", () => {
  const ubuntu = { name: "test", status: "completed", conclusion: "success" };
  expect(
    enforceReleaseJobPolicy([ubuntu], { ubuntuJobs: [ubuntu], windowsJobs: [] }),
  ).toMatchObject({ windowsJobs: [] });
});
