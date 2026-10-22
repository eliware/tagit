import { readWorkflowRunnerLabels } from "../../../../../src/github/runs/runner/workflow/runner-labels.mjs";

test("classifies runner labels declared by a workflow job", () => {
  expect(readWorkflowRunnerLabels(["    runs-on: ubuntu-latest"])).toEqual(["ubuntu"]);
});

test("returns null without a runner declaration and empty labels for unknown runners", () => {
  expect(readWorkflowRunnerLabels(["    steps: []"])).toBeNull();
  expect(readWorkflowRunnerLabels(["    runs-on: self-hosted"])).toEqual([]);
});
