import { validateCiTriggers } from "../../../src/repository/metadata/validate-ci-triggers.mjs";

test("accepts main push and pull request triggers", () => {
  expect(
    validateCiTriggers(["  push:", "    branches:", "      - main", "  pull_request:"]),
  ).toEqual([]);
});

test("reports missing main push and pull request triggers", () => {
  expect(validateCiTriggers(["  push:", "    branches:", "      - release"])).toEqual([
    "BLOCKED: CI workflow must run on pushes to main.",
    "BLOCKED: CI workflow must run on pull requests.",
  ]);
});
