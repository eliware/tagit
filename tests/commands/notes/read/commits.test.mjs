import { jest } from "@jest/globals";
import { readNotesCommits } from "../../../../src/commands/notes/read/commits.mjs";

test("reads and trims commits since the selected tag", () => {
  const execFileSync = jest.fn(() => "abc Release v1.0.1\n");
  expect(readNotesCommits(execFileSync, "v1.0.0")).toBe("abc Release v1.0.1");
  expect(execFileSync).toHaveBeenCalledWith(
    "git",
    ["log", "--oneline", "--decorate", "v1.0.0..HEAD"],
    { encoding: "utf8" },
  );
});
