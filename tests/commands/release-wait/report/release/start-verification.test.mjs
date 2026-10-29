import { jest } from "@jest/globals";
import { reportReleaseVerificationStart } from "../../../../../src/commands/release-wait/report/release/start-verification.mjs";

test("returns release start links as links-only verification evidence", async () => {
  const poll = jest.fn(async () => ({ databaseId: 7, url: "https://ci/7" }));
  const result = await reportReleaseVerificationStart({
    execFile: jest.fn(),
    repo: "eliware/demo",
    headSha: "abc",
    tag: "v1.0.0",
    pollMs: 1,
    maxPolls: 1,
    sleep: jest.fn(),
    log: { info: jest.fn() },
    poll,
  });
  expect(result).toEqual({
    repo: "eliware/demo",
    tag: "v1.0.0",
    headSha: "abc",
    ciRunId: 7,
    publishRunId: null,
    linksOnly: true,
  });
});
