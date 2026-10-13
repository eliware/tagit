import { satisfiesDeclaredRange } from "../../../src/validation/local/satisfies-declared-range.mjs";

test("checks exact and tilde ranges", () => {
  expect(satisfiesDeclaredRange("4.0.1", "4.0.1")).toBe(true);
  expect(satisfiesDeclaredRange("4.0.2", "4.0.1")).toBe(false);
  expect(satisfiesDeclaredRange("4.1.5", "~4.1.0")).toBe(true);
  expect(satisfiesDeclaredRange("4.2.0", "~4.1.0")).toBe(false);
});

test("checks caret ranges for major and zero-major versions", () => {
  expect(satisfiesDeclaredRange("4.2.0", "^4.0.0")).toBe(true);
  expect(satisfiesDeclaredRange("4.0.0", "^4.0.0")).toBe(true);
  expect(satisfiesDeclaredRange("5.0.0", "^4.0.0")).toBe(false);
  expect(satisfiesDeclaredRange("0.2.4", "^0.2.3")).toBe(true);
  expect(satisfiesDeclaredRange("0.2.3", "^0.2.3")).toBe(true);
  expect(satisfiesDeclaredRange("0.3.0", "^0.2.3")).toBe(false);
  expect(satisfiesDeclaredRange("0.0.3", "^0.0.3")).toBe(true);
  expect(satisfiesDeclaredRange("0.0.4", "^0.0.3")).toBe(false);
});

test("rejects unsupported ranges and invalid versions", () => {
  expect(satisfiesDeclaredRange("4.0.0", "latest")).toBe(false);
  expect(satisfiesDeclaredRange("bad", "^4.0.0")).toBe(false);
  expect(satisfiesDeclaredRange("4.0.0", undefined)).toBe(false);
});
