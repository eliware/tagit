import { jest } from "@jest/globals";
import { recoverReleaseCiPollError } from "../../../../../../../src/commands/release-wait/release/ci/poll/error/recovery.mjs";

test("does not retry a completed release CI failure", async () => {
  const sleep = jest.fn();
  const error = Object.assign(new Error("publish failed"), { code: "ERR_RELEASE_CI_FAILED" });
  await expect(recoverReleaseCiPollError(error, 0, 3, 10, sleep)).resolves.toBe(false);
  expect(sleep).not.toHaveBeenCalled();
});

test("delegates retryable errors to the poll retry policy", async () => {
  const sleep = jest.fn();
  await expect(recoverReleaseCiPollError(new Error("network"), 0, 2, 10, sleep)).resolves.toBe(
    true,
  );
  expect(sleep).toHaveBeenCalledWith(10);
});
