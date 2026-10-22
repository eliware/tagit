import { parseWorkflowRunnerLabels } from "../../../src/github/runs/read-workflow-runner-labels.mjs";

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

test("classifies runner labels from inline and block sequences", () => {
  expect(
    parseWorkflowRunnerLabels(
      "jobs:\n  linux:\n    runs-on: [self-hosted, ubuntu-latest]\n  windows:\n    runs-on:\n      - self-hosted\n      - windows-2025\n  ambiguous:\n    runs-on: [ubuntu-latest, windows-latest]\n",
    ),
  ).toEqual({ linux: ["ubuntu"], windows: ["windows"], ambiguous: [] });
});

test("stops a block runner sequence at the next job field", () => {
  expect(
    parseWorkflowRunnerLabels(
      "jobs:\n  empty:\n    runs-on:\n    steps:\n      - run: test\n  nested:\n    runs-on:\n      group: linux\n",
    ),
  ).toEqual({ empty: [], nested: [] });
});

test("handles missing jobs, missing runners, unknown runners, and unnamed jobs", () => {
  expect(parseWorkflowRunnerLabels("name: no jobs")).toEqual({});
  expect(
    parseWorkflowRunnerLabels(
      "jobs:\n  no_runner:\n    steps: []\n  other:\n    runs-on: self-hosted\n",
    ),
  ).toEqual({ other: [] });
});
