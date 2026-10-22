import {
  classifyRunnerPlatforms,
  readRunnerValues,
} from "../../../../src/github/runs/runner/platforms.mjs";

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

test.each([
  [["ubuntu-latest"], ["ubuntu"]],
  [["windows-2025"], ["windows"]],
  [["self-hosted"], []],
  [["ubuntu-latest", "windows-latest"], []],
])("classifies runner values %j", (values, expected) => {
  expect(classifyRunnerPlatforms(values)).toEqual(expected);
});
