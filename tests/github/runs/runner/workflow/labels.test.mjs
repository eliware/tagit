import {
  readRunnerValues,
  readWorkflowRunnerLabels,
} from "../../../../../src/github/runs/runner/workflow/labels.mjs";

test("extracts inline runner labels", () => {
  expect(readRunnerValues(["    runs-on: [self-hosted, ubuntu-latest]"])).toEqual([
    "self-hosted",
    "ubuntu-latest",
  ]);
});

test("extracts block runner labels and stops at the next job field", () => {
  expect(
    readRunnerValues([
      "    runs-on:",
      "      - self-hosted",
      "      - windows-2025",
      "    steps:",
      "      - run: test",
    ]),
  ).toEqual(["self-hosted", "windows-2025"]);
});

test("returns null when a job has no runner declaration", () => {
  expect(readRunnerValues(["    steps: []"])).toBeNull();
});

test("returns no labels for empty or nested runner declarations", () => {
  expect(readRunnerValues(["    runs-on:", "    steps: []"])).toEqual([]);
  expect(readRunnerValues(["    runs-on:", "      group: linux"])).toEqual([]);
});

test("classifies runner labels declared by a workflow job", () => {
  expect(readWorkflowRunnerLabels(["    runs-on: ubuntu-latest"])).toEqual(["ubuntu"]);
});

test("returns null without a runner declaration and empty labels for unknown runners", () => {
  expect(readWorkflowRunnerLabels(["    steps: []"])).toBeNull();
  expect(readWorkflowRunnerLabels(["    runs-on: self-hosted"])).toEqual([]);
});
