import { parseWorkflowRunnerLabelContents } from "../../../../../src/github/runs/runner/workflow/contents-reader.mjs";

test("combines labels from multiple workflow files", () => {
  expect(
    parseWorkflowRunnerLabelContents({
      "ci.yaml": "jobs:\n  validate:\n    runs-on: ubuntu-latest",
      "npm.yaml": "jobs:\n  publish:\n    runs-on: windows-latest",
    }),
  ).toEqual({ validate: ["ubuntu"], publish: ["windows"] });
});

test("marks duplicate job names with conflicting runner labels as unknown", () => {
  const labels = parseWorkflowRunnerLabelContents({
    "ci.yaml": 'jobs:\n  checks:\n    name: "Shared checks"\n    runs-on: ubuntu-latest',
    "npm.yaml": 'jobs:\n  publish:\n    name: "Shared checks"\n    runs-on: windows-latest',
    "ghcr.yaml": 'jobs:\n  image:\n    name: "Shared checks"\n    runs-on: ubuntu-latest',
  });
  expect(labels["Shared checks"]).toEqual([]);
});
