import { requirePublishJob } from "../../../../../src/commands/release-wait/verify/publish/policy.mjs";

test("requires a passing publish job", () => {
  expect(() => requirePublishJob(false)).toThrow("passing publish job");
  expect(() => requirePublishJob(true)).not.toThrow();
});
