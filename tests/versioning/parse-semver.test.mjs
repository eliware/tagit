import { parseSemver } from "../../src/versioning/parse-semver.mjs";

test("parses a three-part semantic version", () => {
  expect(parseSemver("2.5.0")).toEqual([2, 5, 0]);
});

test("rejects invalid versions", () => {
  expect(() => parseSemver("2.5")).toThrow("Invalid version");
  expect(() => parseSemver(undefined)).toThrow("Invalid version");
  expect(() => parseSemver("02.5.0")).toThrow("Invalid version");
  expect(() => parseSemver("1.02.0")).toThrow("Invalid version");
  expect(() => parseSemver("1.2.9007199254740992")).toThrow("Invalid version");
  expect(() => parseSemver(2.5)).toThrow("Invalid version");
});
