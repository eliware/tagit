import {
  isCheckTimeout,
  timeoutFailureMessage,
} from "../../../src/output/errors/timeout-message.mjs";

test.each([
  [{ code: "ETIMEDOUT" }, true],
  [{ signal: "SIGTERM" }, true],
  [new Error("failed"), false],
  [null, false],
])("classifies check timeout errors %p", (error, expected) => {
  expect(isCheckTimeout(error)).toBe(expected);
});

test("formats the check timeout failure", () => {
  expect(timeoutFailureMessage("test")).toContain("180-second limit");
});
