import { hasMainPushTrigger } from "../../../src/repository/metadata/main-push-trigger.mjs";

test("recognizes main branch pushes within the push trigger", () => {
  expect(hasMainPushTrigger(["  push:", "    branches:", "      - main"])).toBe(true);
  expect(
    hasMainPushTrigger(["  push:", "    branches:", "      - release", "  pull_request:"]),
  ).toBe(false);
  expect(hasMainPushTrigger(["  pull_request:"])).toBe(false);
});
