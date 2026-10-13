import { hasBreakingChange } from "../../src/versioning/has-breaking-change.mjs";

test("detects explicit breaking changes and public API changes", () => {
  expect(hasBreakingChange("BREAKING CHANGE: remove option")).toBe(true);
  expect(hasBreakingChange("BREAKING change")).toBe(true);
  expect(hasBreakingChange("+ export function added() {}")).toBe(true);
  expect(hasBreakingChange('+ "exports": {}')).toBe(true);
  expect(hasBreakingChange('+ "bin": {}')).toBe(true);
  expect(hasBreakingChange("documentation update")).toBe(false);
});
