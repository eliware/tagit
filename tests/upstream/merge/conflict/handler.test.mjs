import { jest } from "@jest/globals";
import handleUpstreamMergeConflict from "../../../../src/upstream/merge/conflict/handler.mjs";

test("reports detected conflict files and returns true", () => {
  const execFileSync = jest.fn(() => "file.mjs\n");
  const log = { log: jest.fn() };

  expect(handleUpstreamMergeConflict(execFileSync, log)).toBe(true);
  expect(log.log).toHaveBeenCalledWith(
    "Merge conflicts detected. Resolve conflicts in these files:",
  );
  expect(log.log).toHaveBeenCalledWith("file.mjs");
  expect(execFileSync).toHaveBeenCalledTimes(1);
});

test("returns false when conflict detection finds no files", () => {
  const execFileSync = jest.fn(() => "  \n");
  expect(handleUpstreamMergeConflict(execFileSync, { log: jest.fn() })).toBe(false);
});
