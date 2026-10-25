import { parseRunnerValues } from "../../../../../src/github/runs/runner/workflow/values.mjs";

test("parses inline runner values", () => {
  expect(parseRunnerValues({ value: "[self-hosted, ubuntu-latest]", blockLines: [] })).toEqual([
    "self-hosted",
    "ubuntu-latest",
  ]);
});

test("parses block runner values and stops at the first non-list line", () => {
  expect(
    parseRunnerValues({
      value: "",
      blockLines: ["      - self-hosted", "      - windows-2025", "      steps: []"],
    }),
  ).toEqual(["self-hosted", "windows-2025"]);
});

test("returns no values for absent, empty, and nested declarations", () => {
  expect(parseRunnerValues(null)).toBeNull();
  expect(parseRunnerValues({ value: "", blockLines: [] })).toEqual([]);
  expect(parseRunnerValues({ value: "", blockLines: ["      group: linux"] })).toEqual([]);
});
