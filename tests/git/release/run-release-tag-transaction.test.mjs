import { jest } from "@jest/globals";
import { runReleaseTagTransaction } from "../../../src/git/release/run-release-tag-transaction.mjs";

test("runs the release tag transaction and returns the exact head", () => {
  const log = { info: jest.fn(), error: jest.fn() };
  const prepareReleaseTag = jest.fn(() => ({ currentHead: "abc" }));
  const pushTag = jest.fn();
  const runGit = jest.fn(() => "abc\trefs/tags/v1.0.0\n");
  const verifyPushedTag = jest.fn();
  expect(
    runReleaseTagTransaction({
      execFileSync: jest.fn(),
      log,
      releaseTag: "v1.0.0",
      version: "1.0.0",
      createReleaseCommit: jest.fn(),
      prepareReleaseTag,
      pushReleaseRefs: pushTag,
      runGit,
      verifyPushedTag,
    }),
  ).toEqual({ commitSha: "abc", tag: "v1.0.0" });
  expect(pushTag).toHaveBeenCalled();
  expect(verifyPushedTag).toHaveBeenCalledWith(expect.any(Function), "v1.0.0", "abc");
});
