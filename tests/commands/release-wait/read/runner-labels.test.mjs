import { jest } from "@jest/globals";
import { readReleaseRunnerLabels } from "../../../../src/commands/release-wait/read/runner-labels.mjs";

test("reads CI and declared publication workflow labels from the release commit", () => {
  const execFileSync = jest.fn(() => "jobs:\n  validate:\n    runs-on: ubuntu-latest");
  const publication = {
    workflows: [{ workflowPath: ".github/workflows/npm.yaml" }],
  };
  expect(readReleaseRunnerLabels(execFileSync, "abc123", publication).validate).toEqual(["ubuntu"]);
  expect(execFileSync.mock.calls.map(([, args]) => args[1])).toEqual([
    "abc123:.github/workflows/ci.yaml",
    "abc123:.github/workflows/npm.yaml",
  ]);
});

test("ignores missing optional publication workflows", () => {
  const execFileSync = jest.fn(() => {
    throw new Error("path not found");
  });
  expect(readReleaseRunnerLabels(execFileSync, "abc123", { workflows: [] })).toEqual(
    Object.create(null),
  );
  expect(execFileSync).toHaveBeenCalledTimes(1);
});
