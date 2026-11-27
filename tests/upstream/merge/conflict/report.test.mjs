import { jest } from "@jest/globals";
import reportUpstreamMergeConflict from "../../../../src/upstream/merge/conflict/report.mjs";

test("reports merge conflicts and lists unresolved files", () => {
  const log = { log: jest.fn() };
  reportUpstreamMergeConflict(log, "file.mjs\nother.mjs\n");
  expect(log.log).toHaveBeenCalledWith(
    "Merge conflicts detected. Resolve conflicts in these files:",
  );
  expect(log.log).toHaveBeenCalledWith("file.mjs\nother.mjs");
});
