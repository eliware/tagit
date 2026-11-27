import { jest } from "@jest/globals";
import reportReleaseStart from "../../../../../src/commands/release-wait/report/release/start.mjs";

test("propagates CI polling failures without reporting release links", async () => {
  const log = { info: jest.fn() };
  const poll = jest.fn().mockRejectedValue(new Error("CI polling failed"));
  await expect(
    reportReleaseStart({
      execFile: jest.fn(),
      repo: "eliware/demo",
      headSha: "abc",
      tag: "v1.0.0",
      pollMs: 1,
      maxPolls: 2,
      sleep: jest.fn(),
      log,
      poll,
    }),
  ).rejects.toThrow("CI polling failed");
  expect(log.info).not.toHaveBeenCalled();
});
