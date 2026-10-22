import { classifyRunnerPlatforms } from "../../../../src/github/runs/runner/platforms.mjs";

test.each([
  [["ubuntu-latest"], ["ubuntu"]],
  [["windows-2025"], ["windows"]],
  [["self-hosted"], []],
  [["ubuntu-latest", "windows-latest"], []],
])("classifies runner values %j", (values, expected) => {
  expect(classifyRunnerPlatforms(values)).toEqual(expected);
});
