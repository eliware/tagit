import { jest } from "@jest/globals";
import { handleUpstreamMergeConflict } from "../../../../src/upstream/merge/conflict/handler.mjs";

test("reports conflict files and returns true when conflicts exist", () => {
  const execFileSync = jest.fn().mockReturnValueOnce("file.mjs");
  const log = { log: jest.fn() };

  expect(handleUpstreamMergeConflict(execFileSync, log)).toBe(true);
  expect(log.log).toHaveBeenCalledWith(
    "Merge conflicts detected. Resolve conflicts in these files:",
  );
  expect(execFileSync).toHaveBeenCalledWith("git", ["diff", "--name-only", "--diff-filter=U"], {
    stdio: "inherit",
  });
});

test("returns false when conflict detection finds no files", () => {
  const execFileSync = jest.fn(() => "  \n");
  expect(handleUpstreamMergeConflict(execFileSync, { log: jest.fn() })).toBe(false);
});
