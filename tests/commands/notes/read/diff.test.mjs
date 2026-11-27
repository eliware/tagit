import { jest } from "@jest/globals";
import readNotesDiff from "../../../../src/commands/notes/read/diff.mjs";

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
    { encoding: "utf8", maxBuffer: 48000 },
  );
});

test("returns the bounded partial diff when Git reaches the output limit", () => {
  const error = new Error("Output buffer limit reached.");
  error.code = "ENOBUFS";
  error.stdout = "x".repeat(12001);
  const execFileSync = jest.fn(() => {
    throw error;
  });
  expect(readNotesDiff(execFileSync, "v1.0.0")).toBe("x".repeat(12001));
});

test("preserves Git errors unrelated to the output limit", () => {
  const error = new Error("Tag does not exist.");
  const execFileSync = jest.fn(() => {
    throw error;
  });
  expect(() => readNotesDiff(execFileSync, "v1.0.0")).toThrow(error);
});
