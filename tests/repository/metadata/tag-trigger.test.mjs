import { hasTagTrigger } from "../../../src/repository/metadata/tag-trigger.mjs";

test("recognizes canonical numeric tag filters", () => {
  expect(hasTagTrigger(["  tags:", '      - "v[0-9]*.[0-9]*.[0-9]*"'])).toBe(true);
  expect(hasTagTrigger(["  tags:", "      - v*"])).toBe(false);
  expect(hasTagTrigger([])).toBe(false);
});
