import { validateCiRunRecords } from "../../../../src/github/links/read/validate-ci-run-records.mjs";

test("accepts an array of valid CI run link records", () => {
  const runs = [{ databaseId: 1, url: "run", headSha: "abc" }];
  expect(validateCiRunRecords(runs)).toBe(runs);
});

test("rejects a non-array response", () => {
  expect(() => validateCiRunRecords({ runs: [] })).toThrow("must be an array");
});

test.each([
  null,
  42,
  {},
  { databaseId: "bad", url: "run", headSha: "abc" },
  { databaseId: 1, url: "run", headSha: 1 },
  { databaseId: 1, url: 2, headSha: "abc" },
])("rejects malformed CI run records: %p", (run) => {
  expect(() => validateCiRunRecords([run])).toThrow("malformed run records: 1");
});
