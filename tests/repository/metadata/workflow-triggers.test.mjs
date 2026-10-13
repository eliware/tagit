import {
  hasMainPushTrigger,
  hasTagTrigger,
} from "../../../src/repository/metadata/workflow-triggers.mjs";

test("recognizes main branch pushes within the push trigger", () => {
  expect(hasMainPushTrigger(["  push:", "    branches:", "      - main"])).toBe(true);
  expect(
    hasMainPushTrigger(["  push:", "    branches:", "      - release", "  pull_request:"]),
  ).toBe(false);
  expect(hasMainPushTrigger(["  pull_request:"])).toBe(false);
});

test("recognizes canonical numeric tag filters", () => {
  expect(hasTagTrigger(["  tags:", '      - "v[0-9]*.[0-9]*.[0-9]*"'])).toBe(true);
  expect(hasTagTrigger(["  tags:", "      - v*"])).toBe(false);
  expect(hasTagTrigger([])).toBe(false);
});
