import { requirePublishJob } from "../../../../../src/commands/release-wait/verify/publish/policy.mjs";

const publicTarget = { applicable: true, packageName: "demo", isPrivate: false };

test("requires a passing job for a public npm target", () => {
  expect(() => requirePublishJob([], publicTarget)).toThrow("passing publish job");
  expect(() => requirePublishJob([{ name: "publish" }], publicTarget)).not.toThrow();
});

test.each([
  [{ applicable: false, packageName: "demo", isPrivate: false }],
  [{ applicable: true, packageName: null, isPrivate: false }],
  [{ applicable: true, packageName: "demo", isPrivate: true }],
])("does not require a publish job for an inapplicable target: %j", (target) => {
  expect(() => requirePublishJob([], target)).not.toThrow();
});
