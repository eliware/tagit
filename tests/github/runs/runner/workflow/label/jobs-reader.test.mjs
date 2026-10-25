import { readWorkflowJobs } from "../../../../../../src/github/runs/runner/workflow/label/jobs-reader.mjs";

test("reads job blocks from a workflow document", () => {
  expect(readWorkflowJobs("jobs:\n  validate:\n    runs-on: ubuntu-latest\n")).toEqual(
    new Map([["validate", ["    runs-on: ubuntu-latest"]]]),
  );
});

test("returns no jobs when the workflow has no jobs section", () => {
  expect(readWorkflowJobs("name: no jobs")).toEqual(new Map());
});
