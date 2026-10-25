import { parseWorkflowRunnerLabelContents } from "../../../../../src/github/runs/runner/workflow/contents-reader.mjs";

test("combines labels from multiple workflow files", () => {
  expect(
    parseWorkflowRunnerLabelContents({
      "ci.yaml": "jobs:\n  validate:\n    runs-on: ubuntu-latest",
      "npm.yaml": "jobs:\n  publish:\n    runs-on: windows-latest",
    }),
  ).toEqual({ validate: ["ubuntu"], publish: ["windows"] });
});
