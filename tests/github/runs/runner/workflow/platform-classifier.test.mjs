import { classifyWorkflowRunnerValues } from "../../../../../src/github/runs/runner/workflow/platform-classifier.mjs";

test("classifies supported runner platforms", () => {
  expect(classifyWorkflowRunnerValues(["ubuntu-latest"])).toEqual(["ubuntu"]);
});

test("preserves missing declarations and rejects unknown or mixed platforms", () => {
  expect(classifyWorkflowRunnerValues(null)).toBeNull();
  expect(classifyWorkflowRunnerValues(["self-hosted"])).toEqual([]);
  expect(classifyWorkflowRunnerValues(["ubuntu-latest", "windows-latest"])).toEqual([]);
});
