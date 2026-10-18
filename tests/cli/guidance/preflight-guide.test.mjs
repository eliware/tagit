import { preflightGuide } from "../../../src/cli/guidance/preflight-guide.mjs";
test("documents shared validation and optional Windows CI", () => {
  expect(preflightGuide()).toContain(
    "shared harness checks tests, lint, type checks, audit, packaging",
  );
  expect(preflightGuide()).toContain("Windows CI is optional.");
  expect(preflightGuide()).toContain("Require each Windows job to pass when one exists.");
});
