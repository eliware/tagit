import { failureMessage } from "../../../src/output/errors/failure-message.mjs";

test("formats timeout and regular failures", () => {
  expect(failureMessage("test", { code: "ETIMEDOUT" })).toContain("180-second limit");
  expect(failureMessage("test", new Error("failed"), "details")).toContain("details");
});
