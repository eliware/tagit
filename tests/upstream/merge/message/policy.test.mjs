import { validateMergeMessage } from "../../../../src/upstream/merge/message/policy.mjs";

test("accepts messages at the length limit", () => {
  expect(() => validateMergeMessage("x".repeat(500))).not.toThrow();
});

test("rejects messages that exceed the length limit", () => {
  expect(() => validateMergeMessage("x".repeat(501))).toThrow("too long");
});

test("rejects control characters", () => {
  expect(() => validateMergeMessage("bad\nmessage")).toThrow("unsupported control characters");
});
