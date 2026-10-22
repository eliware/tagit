import { validateReleaseRunRecords } from "../../../../../src/github/runs/release/run/records.mjs";

test("requires an array of release run records", () => {
  expect(() => validateReleaseRunRecords(null, "v1.0.0")).toThrow("not an array");
  expect(validateReleaseRunRecords([], "v1.0.0")).toEqual([]);
});

test.each([
  [null, "null"],
  ["run", "string"],
  [{ databaseId: "bad", headSha: "abc", headBranch: "main" }, "database id"],
  [{ databaseId: 1, headSha: 42, headBranch: "main" }, "head SHA"],
  [{ databaseId: 1, headSha: "abc" }, "head branch"],
])("rejects malformed run identity: %s", (record) => {
  expect(() => validateReleaseRunRecords([record], "v1.0.0")).toThrow("identity is incomplete");
});

test("rejects invalid timestamps and accepts valid or absent timestamps", () => {
  expect(() =>
    validateReleaseRunRecords(
      [{ databaseId: 1, headSha: "abc", headBranch: "main", createdAt: "not-a-date" }],
      "v1.0.0",
    ),
  ).toThrow("timestamp is invalid");
  const record = { databaseId: 2, headSha: "abc", headBranch: "main" };
  expect(validateReleaseRunRecords([record], "v1.0.0")).toEqual([record]);
  expect(
    validateReleaseRunRecords([{ ...record, createdAt: "2026-01-01" }], "v1.0.0"),
  ).toHaveLength(1);
});
