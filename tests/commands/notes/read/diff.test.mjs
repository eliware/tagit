import { jest } from "@jest/globals";
import { readNotesDiff } from "../../../../src/commands/notes/read/diff.mjs";

test("reads and trims the source diff without generated files", () => {
  const execFileSync = jest.fn(() => "+change\n");
  expect(readNotesDiff(execFileSync, "v1.0.0")).toBe("+change");
  expect(execFileSync).toHaveBeenCalledWith(
    "git",
    [
      "diff",
      "v1.0.0..HEAD",
      "--",
      ".",
      ":!package-lock.json",
      ":!coverage",
      ":!node_modules",
      ":!**/.jest-result",
      ":!**/.jest.result",
    ],
    { encoding: "utf8" },
  );
});
