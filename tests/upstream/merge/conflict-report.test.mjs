import { jest } from "@jest/globals";
import { reportUpstreamMergeConflict } from "../../../src/upstream/merge/conflict-report.mjs";

test("reports merge conflicts and lists unresolved files", () => {
  const exec = jest.fn();
  const log = { log: jest.fn() };
  reportUpstreamMergeConflict(exec, log);
  expect(log.log).toHaveBeenCalledWith(
    "Merge conflicts detected. Resolve conflicts in these files:",
  );
  expect(exec).toHaveBeenCalledWith("git", ["diff", "--name-only", "--diff-filter=U"], {
    stdio: "inherit",
  });
});
