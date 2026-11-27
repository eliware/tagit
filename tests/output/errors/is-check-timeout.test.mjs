import isCheckTimeout from "../../../src/output/errors/is-check-timeout.mjs";

test.each([
  [{ code: "ETIMEDOUT" }, true],
  [{ signal: "SIGTERM" }, true],
  [new Error("failed"), false],
  [null, false],
])("classifies check timeout errors %p", (error, expected) => {
  expect(isCheckTimeout(error)).toBe(expected);
});
