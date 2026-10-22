import { selectReleaseRunnerWorkflowPaths } from "../../../../../src/commands/release-wait/read/runner/workflow-paths.mjs";

test("selects CI and declared publication workflow paths", () => {
  expect(
    selectReleaseRunnerWorkflowPaths({
      workflows: [
        { workflowPath: ".github/workflows/npm.yaml" },
        { workflowPath: ".github/workflows/ghcr.yaml" },
      ],
    }),
  ).toEqual([
    ".github/workflows/ci.yaml",
    ".github/workflows/npm.yaml",
    ".github/workflows/ghcr.yaml",
  ]);
});
