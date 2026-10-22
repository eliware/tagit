import { jest } from "@jest/globals";
import { retryPendingRun } from "../../../../src/validation/ci/verify/pending-run.mjs";

test("does not retry when there is no pending run", () => {
  const retry = jest.fn();
  expect(retryPendingRun(jest.fn(), { info: jest.fn() }, null, [], 0, retry)).toBe(false);
  expect(retry).not.toHaveBeenCalled();
});

test("polls a pending run and returns the retry result", () => {
  const exec = jest.fn(() => {
    throw new Error("The run remains active.");
  });
  const retry = jest.fn(() => "verified");
  const result = retryPendingRun(
    exec,
    { info: jest.fn() },
    { databaseId: 2, url: "https://github.com/eliware/demo/actions/runs/2" },
    [],
    0,
    retry,
  );
  expect(result).toBe("verified");
  expect(retry).toHaveBeenCalledTimes(1);
});
