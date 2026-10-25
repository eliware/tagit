import { selectReleaseRunnerWorkflowPaths } from "../../../../../src/commands/release-wait/read/runner/workflow-paths.mjs";

test("selects only the CI workflow for CI runner checks", () => {
  expect(selectReleaseRunnerWorkflowPaths()).toEqual([".github/workflows/ci.yaml"]);
});
