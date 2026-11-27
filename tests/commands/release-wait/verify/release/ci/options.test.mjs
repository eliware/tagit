import { jest } from "@jest/globals";
import buildReleaseCiPollOptions from "../../../../../../src/commands/release-wait/verify/release/ci/options.mjs";

test("builds shared CI poll options", () => {
  const options = {
    execFile: jest.fn(),
    repo: "eliware/demo",
    headSha: "abc",
    tag: "v1.0.0",
    pollMs: 10,
    maxPolls: 3,
    sleep: jest.fn(),
    log: { info: jest.fn() },
  };
  expect(buildReleaseCiPollOptions(options)).toEqual(options);
});
