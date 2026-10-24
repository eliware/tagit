import { buildCompletedRunResult } from "../../../../../src/validation/ci/read/completed/run-result.mjs";

const data = { status: "completed", conclusion: "success", headSha: "abc" };
const policy = {
  failed: false,
  ubuntu: true,
  windows: { passed: true, successful: true },
};

test("builds a passing result with Ubuntu and Windows evidence", () => {
  const result = buildCompletedRunResult(data, "abc", policy);
  expect(result).toEqual({
    passed: true,
    platforms: "Ubuntu and Windows passed",
    policy,
  });
});

test.each([
  [{ failed: true }],
  [{ data: { status: "in_progress" } }],
  [{ data: { conclusion: "failure" } }],
  [{ data: { headSha: "other" } }],
  [{ policy: { ubuntu: false } }],
  [{ policy: { windows: { passed: false, successful: false } } }],
])("marks a failed result when a required check does not pass: %j", (overrides) => {
  const result = buildCompletedRunResult({ ...data, ...overrides.data }, "abc", {
    ...policy,
    ...overrides.policy,
    windows: { ...policy.windows, ...overrides.policy?.windows },
    failed: overrides.failed ?? policy.failed,
  });
  expect(result.passed).toBe(false);
});

test("reports Ubuntu alone when Windows evidence did not pass", () => {
  expect(
    buildCompletedRunResult(data, "abc", {
      ...policy,
      windows: { passed: true, successful: false },
    }).platforms,
  ).toBe("Ubuntu passed");
});
