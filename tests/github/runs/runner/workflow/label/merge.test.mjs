import { mergeWorkflowRunnerLabelEntries } from "../../../../../../src/github/runs/runner/workflow/label/merge.mjs";

test("keeps labels when repeated identities agree", () => {
  expect(
    mergeWorkflowRunnerLabelEntries([
      { name: "validate", labels: ["ubuntu"] },
      { name: "validate", labels: ["ubuntu"] },
    ]),
  ).toEqual({ validate: ["ubuntu"] });
});

test("marks conflicting identities as unknown", () => {
  expect(
    mergeWorkflowRunnerLabelEntries([
      { name: "validate", labels: ["ubuntu"] },
      { name: "validate", labels: ["windows"] },
      { name: "validate", labels: ["ubuntu"] },
    ]),
  ).toEqual({ validate: [] });
});
