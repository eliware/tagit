import isValidMergeMessageLength from "../../../../src/upstream/merge/message/length-policy.mjs";

test("accepts messages up to the length limit", () => {
  expect(isValidMergeMessageLength("x".repeat(500))).toBe(true);
});

test("rejects messages above the length limit", () => {
  expect(isValidMergeMessageLength("x".repeat(501))).toBe(false);
});
