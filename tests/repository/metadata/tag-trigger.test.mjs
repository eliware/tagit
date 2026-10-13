import { hasTagTrigger } from "../../../src/repository/metadata/tag-trigger.mjs";

test("recognizes canonical numeric tag filters", () => {
  expect(hasTagTrigger(["  push:", "    tags:", '      - "v[0-9]*.[0-9]*.[0-9]*"'])).toBe(true);
  expect(hasTagTrigger(["  push:", "    tags:", "      - v*"])).toBe(false);
  expect(hasTagTrigger([])).toBe(false);
});

test("requires the numeric filter under the push tag list", () => {
  expect(
    hasTagTrigger([
      "  pull_request:",
      "    tags:",
      "      - v[0-9]*.[0-9]*.[0-9]*",
      "  push:",
      "    branches:",
      "      - main",
    ]),
  ).toBe(false);
  expect(
    hasTagTrigger([
      "  push:",
      "    branches:",
      "      - main",
      "  pull_request:",
      "    tags:",
      "      - v[0-9]*.[0-9]*.[0-9]*",
    ]),
  ).toBe(false);
});
