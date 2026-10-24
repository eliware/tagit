import { formatReleasePollFailure } from "../../../../../../src/commands/release-wait/release/ci/poll/failure-message.mjs";

test("returns no message for a passing or pending run", () => {
  expect(
    formatReleasePollFailure({ status: "completed", conclusion: "success", jobs: [] }, "npm"),
  ).toBeNull();
  expect(
    formatReleasePollFailure({ status: "in_progress", conclusion: null, jobs: [] }, "npm"),
  ).toBeNull();
});

test("uses the selected workflow label in a failure message", () => {
  expect(
    formatReleasePollFailure(
      {
        status: "completed",
        conclusion: "failure",
        jobs: [{ name: "publish", status: "completed", conclusion: "failure" }],
      },
      "npm",
    ),
  ).toBe("Release npm failed: failure. Jobs: publish [completed/failure].");
});

test("uses CI when the workflow label is missing", () => {
  expect(
    formatReleasePollFailure({ status: "completed", conclusion: "failure", jobs: [] }, undefined),
  ).toBe("Release CI failed: failure. Jobs: none reported.");
});
