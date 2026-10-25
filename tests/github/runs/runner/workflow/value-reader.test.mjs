import { readRunnerValueDeclaration } from "../../../../../src/github/runs/runner/workflow/value-reader.mjs";

test("extracts the runs-on declaration and its indented block", () => {
  expect(
    readRunnerValueDeclaration([
      "    runs-on:",
      "      - self-hosted",
      "      - windows-2025",
      "    steps:",
      "      - run: test",
    ]),
  ).toEqual({
    value: "",
    blockLines: ["      - self-hosted", "      - windows-2025"],
  });
});

test("returns inline declarations and identifies missing declarations", () => {
  expect(readRunnerValueDeclaration(["    runs-on: [ubuntu, windows]"])).toEqual({
    value: "[ubuntu, windows]",
    blockLines: [],
  });
  expect(readRunnerValueDeclaration(["    steps: []"])).toBeNull();
});
