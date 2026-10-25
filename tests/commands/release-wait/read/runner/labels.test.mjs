import { jest } from "@jest/globals";
import { readReleaseRunnerLabels } from "../../../../../src/commands/release-wait/read/runner/labels.mjs";

test("reads CI runner labels from the release commit", () => {
  const execFileSync = jest.fn(() => "jobs:\n  validate:\n    runs-on: ubuntu-latest");
  expect(readReleaseRunnerLabels(execFileSync, "abc123")).toEqual({
    validate: ["ubuntu"],
  });
  expect(execFileSync.mock.calls.map(([, args]) => args[1])).toEqual([
    "abc123:.github/workflows/ci.yaml",
  ]);
});
