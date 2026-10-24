import { jest } from "@jest/globals";
import { readNotesFiles } from "../../../../src/commands/notes/read/files.mjs";

test("reads and trims changed file names since the selected tag", () => {
  const execFileSync = jest.fn(() => "M\tREADME.md\n");
  expect(readNotesFiles(execFileSync, "v1.0.0")).toBe("M\tREADME.md");
  expect(execFileSync).toHaveBeenCalledWith(
    "git",
    ["diff", "--name-status", "v1.0.0..HEAD", "--"],
    { encoding: "utf8" },
  );
});
