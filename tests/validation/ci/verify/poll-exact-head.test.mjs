import { jest } from "@jest/globals";
import { pollExactHeadCi } from "../../../../src/validation/ci/verify/poll-exact-head.mjs";

const pending = { databaseId: 2, url: "https://github.com/eliware/demo/actions/runs/2" };

test.each([
  [{ pending: null, waitForCompletion: true }, false],
  [{ pending, waitForCompletion: false }, false],
])("does not retry when polling is not available: %j", (options, expected) => {
  const execFileSync = jest.fn();
  const retry = jest.fn();
  expect(
    pollExactHeadCi({
      execFileSync,
      log: { info: jest.fn() },
      repoArg: [],
      attempt: 0,
      retry,
      ...options,
    }),
  ).toBe(expected);
  expect(execFileSync).not.toHaveBeenCalled();
  expect(retry).not.toHaveBeenCalled();
});

test.each([
  [
    "while the run remains active",
    () => {
      throw new Error("The run remains active.");
    },
  ],
  ["after a successful watch", () => "completed"],
])("polls the pending run and increments the retry attempt %s", (_label, watch) => {
  const execFileSync = jest.fn(watch);
  const retry = jest.fn((attempt) => attempt);
  expect(
    pollExactHeadCi({
      execFileSync,
      log: { info: jest.fn() },
      pending,
      repoArg: [],
      attempt: 4,
      waitForCompletion: true,
      retry,
    }),
  ).toBe(5);
  expect(retry).toHaveBeenCalledWith(5);
});
