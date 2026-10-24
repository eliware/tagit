import { isReleaseCiFailure } from "../../../../../../src/commands/release-wait/release/ci/poll/is-failure.mjs";
import { formatReleaseCiFailure } from "../../../../../../src/commands/release-wait/format-release-ci-failure.mjs";

test("identifies completed runs that did not pass", () => {
  expect(isReleaseCiFailure({ status: "completed", conclusion: "failure" })).toBe(true);
  expect(isReleaseCiFailure({ status: "completed", conclusion: "cancelled" })).toBe(true);
});

test("does not identify pending or successful runs as failures", () => {
  expect(isReleaseCiFailure({ status: "in_progress", conclusion: null })).toBe(false);
  expect(isReleaseCiFailure({ status: "completed", conclusion: "success" })).toBe(false);
  expect(formatReleaseCiFailure({ status: "in_progress", conclusion: null, jobs: [] })).toBeNull();
  expect(
    formatReleaseCiFailure({ status: "completed", conclusion: "success", jobs: [] }),
  ).toBeNull();
});
