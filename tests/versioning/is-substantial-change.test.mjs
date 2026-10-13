import { isSubstantialChange } from "../../src/versioning/is-substantial-change.mjs";

test("classifies source paths, many files, and large diffs as substantial", () => {
  expect(isSubstantialChange(["src/a.mjs"], "small diff")).toBe(true);
  expect(isSubstantialChange(["README.md"], "+line\n".repeat(201))).toBe(true);
  expect(isSubstantialChange(["a", "b", "c", "d", "e"], "small diff")).toBe(true);
});

test("keeps a small documentation change below the substantial threshold", () => {
  expect(isSubstantialChange(["README.md"], "docs")).toBe(false);
});
