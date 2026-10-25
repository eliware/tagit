import { parseWorkflowRunnerLabels } from "../../../../../../src/github/runs/runner/workflow/label/reader.mjs";

test("parses jobs before mapping runner labels", () => {
  expect(parseWorkflowRunnerLabels("jobs:\n  validate:\n    runs-on: ubuntu-latest\n")).toEqual({
    validate: ["ubuntu"],
  });
});

test("returns no labels when workflow jobs are absent", () => {
  expect(parseWorkflowRunnerLabels("name: no jobs")).toEqual({});
});
