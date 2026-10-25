import { jest } from "@jest/globals";
import { buildReleaseCiPollOptions } from "../../../../../../src/commands/release-wait/verify/release/ci/options.mjs";

test.each([true, false])("builds shared CI poll options with linksOnly=%s", (linksOnly) => {
  const options = {
    execFile: jest.fn(),
    repo: "eliware/demo",
    headSha: "abc",
    tag: "v1.0.0",
    pollMs: 10,
    maxPolls: 3,
    sleep: jest.fn(),
    linksOnly,
    log: { info: jest.fn() },
  };
  expect(buildReleaseCiPollOptions(options)).toEqual(options);
});
