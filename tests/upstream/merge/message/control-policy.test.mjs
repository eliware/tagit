import hasUnsupportedControlCharacters from "../../../../src/upstream/merge/message/control-policy.mjs";

test("detects control characters", () => {
  expect(hasUnsupportedControlCharacters("bad\nmessage")).toBe(true);
  expect(hasUnsupportedControlCharacters("safe message")).toBe(false);
});
