import { enforceRequiredPlatformPolicy } from "../../../../../src/github/runs/release/job/required-platform-policy.mjs";

const successful = (job) => job.status === "completed" && job.conclusion === "success";
const ubuntu = { name: "test", status: "completed", conclusion: "success" };

test("accepts successful required Ubuntu evidence and permitted skipped jobs", () => {
  expect(() =>
    enforceRequiredPlatformPolicy(
      [ubuntu, { name: "optional", status: "completed", conclusion: "skipped" }],
      [ubuntu],
      successful,
    ),
  ).not.toThrow();
});

test("rejects failed general jobs", () => {
  expect(() =>
    enforceRequiredPlatformPolicy(
      [ubuntu, { name: "publish", status: "completed", conclusion: "failure" }],
      [ubuntu],
      successful,
    ),
  ).toThrow("publish: failure");
});

test("rejects missing or unsuccessful Ubuntu evidence", () => {
  expect(() => enforceRequiredPlatformPolicy([ubuntu], [], successful)).toThrow("Ubuntu");
  const failedUbuntu = { name: "test", status: "completed", conclusion: "failure" };
  expect(() => enforceRequiredPlatformPolicy([], [failedUbuntu], successful)).toThrow("Ubuntu");
});
