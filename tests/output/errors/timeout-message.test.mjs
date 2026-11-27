import timeoutFailureMessage from "../../../src/output/errors/timeout-message.mjs";

test("formats the check timeout failure", () => {
  expect(timeoutFailureMessage("test")).toContain("180-second limit");
});
