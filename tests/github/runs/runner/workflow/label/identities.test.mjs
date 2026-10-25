import { readWorkflowJobLabelEntries } from "../../../../../../src/github/runs/runner/workflow/label/identities.mjs";

test("extracts both job ids and display names with their labels", () => {
  expect(
    readWorkflowJobLabelEntries(
      new Map([["validate", ["    name: Validation", "    runs-on: ubuntu-latest"]]]),
    ),
  ).toEqual([
    { name: "Validation", labels: ["ubuntu"] },
    { name: "validate", labels: ["ubuntu"] },
  ]);
});

test("skips jobs without runner declarations", () => {
  expect(readWorkflowJobLabelEntries(new Map([["validate", ["    steps: []"]]]))).toEqual([]);
});
