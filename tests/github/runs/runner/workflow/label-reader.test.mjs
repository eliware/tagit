import {
  parseWorkflowRunnerLabelContents,
  parseWorkflowRunnerLabels,
} from "../../../../../src/github/runs/runner/workflow/label-reader.mjs";

test("maps workflow job ids and display names to runner platforms", () => {
  expect(
    parseWorkflowRunnerLabels(
      `jobs:\n  validate:\n    runs-on: ubuntu-latest\n  win:\n    name: Windows checks\n    runs-on: windows-latest\n`,
    ),
  ).toEqual({ validate: ["ubuntu"], win: ["windows"], "Windows checks": ["windows"] });
});

test("records runner labels for prototype-named jobs", () => {
  const labels = parseWorkflowRunnerLabels("jobs:\n  __proto__:\n    runs-on: ubuntu-latest\n");
  expect(Object.hasOwn(labels, "__proto__")).toBe(true);
  expect(labels["__proto__"]).toEqual(["ubuntu"]);
});

test("handles missing jobs, missing runners, unknown runners, and unnamed jobs", () => {
  expect(parseWorkflowRunnerLabels("name: no jobs")).toEqual({});
  expect(
    parseWorkflowRunnerLabels(
      "jobs:\n  no_runner:\n    steps: []\n  other:\n    runs-on: self-hosted\n",
    ),
  ).toEqual({ other: [] });
});

test("combines labels from multiple workflow files", () => {
  expect(
    parseWorkflowRunnerLabelContents({
      "ci.yaml": "jobs:\n  validate:\n    runs-on: ubuntu-latest",
      "npm.yaml": "jobs:\n  publish:\n    runs-on: windows-latest",
    }),
  ).toEqual({ validate: ["ubuntu"], publish: ["windows"] });
});
