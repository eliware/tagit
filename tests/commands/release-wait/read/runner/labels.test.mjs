import { jest } from "@jest/globals";
import { readReleaseRunnerLabels } from "../../../../../src/commands/release-wait/read/runner/labels.mjs";

test("combines CI and declared publication workflow labels from the release commit", () => {
  const execFileSync = jest
    .fn()
    .mockReturnValueOnce("jobs:\n  validate:\n    runs-on: ubuntu-latest")
    .mockReturnValueOnce("jobs:\n  publish:\n    runs-on: windows-latest");
  const publication = {
    workflows: [{ workflowPath: ".github/workflows/npm.yaml" }],
  };
  expect(readReleaseRunnerLabels(execFileSync, "abc123", publication)).toEqual({
    validate: ["ubuntu"],
    publish: ["windows"],
  });
  expect(execFileSync.mock.calls.map(([, args]) => args[1])).toEqual([
    "abc123:.github/workflows/ci.yaml",
    "abc123:.github/workflows/npm.yaml",
  ]);
});
