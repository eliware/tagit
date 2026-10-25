import { jest } from "@jest/globals";
import { handleReleaseCiPollError } from "../../../../../../../src/commands/release-wait/release/ci/poll/error/policy.mjs";

test("rethrows malformed JSON immediately", async () => {
  const error = new SyntaxError("bad");
  error.code = "ERR_RELEASE_CI_LIST_JSON";
  await expect(handleReleaseCiPollError(error, 0, 3, 0, jest.fn())).rejects.toThrow(
    "malformed list JSON",
  );
});

test("retries malformed details JSON", async () => {
  const error = new SyntaxError("bad details");
  error.code = "ERR_RELEASE_CI_DETAILS_JSON";
  const sleep = jest.fn();
  await expect(handleReleaseCiPollError(error, 0, 3, 10, sleep)).resolves.toBeUndefined();
  expect(sleep).toHaveBeenCalledWith(10);
});

test("sleeps for retryable errors and fails after the final attempt", async () => {
  const sleep = jest.fn();
  await expect(
    handleReleaseCiPollError(new Error("network"), 0, 2, 10, sleep),
  ).resolves.toBeUndefined();
  expect(sleep).toHaveBeenCalledWith(10);
  await expect(handleReleaseCiPollError(new Error("network"), 1, 2, 10, sleep)).rejects.toThrow(
    "after 2 attempts",
  );
});
