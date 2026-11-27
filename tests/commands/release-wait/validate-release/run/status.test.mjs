import isValidReleaseRunStatus from "../../../../../src/commands/release-wait/validate-release/run/status.mjs";

test.each(["queued", "in_progress", "waiting", "requested", "pending"])(
  "accepts pending status %s without a conclusion",
  (status) => {
    expect(isValidReleaseRunStatus(status, null)).toBe(true);
  },
);

test("accepts a completed status with a known conclusion", () => {
  expect(isValidReleaseRunStatus("completed", "success")).toBe(true);
});

test.each([
  [null, null],
  ["unknown_terminal", null],
  ["queued", 1],
  ["queued", "unknown"],
  ["completed", null],
  ["completed", undefined],
])("rejects invalid status and conclusion combinations %j", (status, conclusion) => {
  expect(isValidReleaseRunStatus(status, conclusion)).toBe(false);
});
