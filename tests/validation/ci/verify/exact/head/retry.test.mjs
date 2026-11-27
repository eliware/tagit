import { jest } from "@jest/globals";
import retryExactHeadCi from "../../../../../../src/validation/ci/verify/exact/head/retry.mjs";

test("rechecks the exact head after polling a pending run", () => {
  const execFileSync = jest.fn(() => "completed");
  const log = { info: jest.fn() };
  const verifyLatestCi = jest.fn(() => "verified");
  expect(
    retryExactHeadCi(
      {
        execFileSync,
        log,
        pending: { databaseId: 2 },
        repoArg: ["--repo", "eliware/demo"],
        attempt: 0,
        waitForCompletion: true,
        headSha: "abc",
        repository: "eliware/demo",
        runnerLabelsByJobName: { validate: ["ubuntu"] },
      },
      verifyLatestCi,
    ),
  ).toBe("verified");
  expect(verifyLatestCi).toHaveBeenCalledWith(
    execFileSync,
    log,
    {
      headSha: "abc",
      repository: "eliware/demo",
      waitForCompletion: true,
      runnerLabelsByJobName: { validate: ["ubuntu"] },
    },
    1,
    null,
  );
});

test("does not retry when completion waiting is disabled", () => {
  const verifyLatestCi = jest.fn();
  expect(
    retryExactHeadCi(
      {
        execFileSync: jest.fn(),
        log: { info: jest.fn() },
        pending: { databaseId: 2 },
        repoArg: [],
        attempt: 0,
        waitForCompletion: false,
        headSha: "abc",
        repository: "eliware/demo",
        runnerLabelsByJobName: {},
      },
      verifyLatestCi,
    ),
  ).toBe(false);
  expect(verifyLatestCi).not.toHaveBeenCalled();
});
