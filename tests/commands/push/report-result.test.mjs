import { jest } from "@jest/globals";
import { reportPushResult } from "../../../src/commands/push/report-result.mjs";

test("reads the pushed commit and reports its CI links", () => {
  const execFileSync = jest.fn(() => "abc\n");
  const reportCiLinks = jest.fn();
  const log = { info: jest.fn() };
  reportPushResult(execFileSync, reportCiLinks, log);
  expect(execFileSync).toHaveBeenCalledWith("git", ["rev-parse", "HEAD"], { encoding: "utf8" });
  expect(reportCiLinks).toHaveBeenCalledWith(execFileSync, log, "abc", {
    attempts: 10,
    delayMs: 2000,
  });
  expect(log.info).toHaveBeenCalledWith(
    "Push completed. The tagit command did not stage untracked files.",
  );
});
