import mergeMessage from "../../../../src/upstream/merge/message/build.mjs";

test("builds a safe supplied merge message", () => {
  expect(mergeMessage(["merge"], new Date("2026-07-29T18:07:59Z"))).toBe("merge");
});

test("rejects an unsafe merge message", () => {
  expect(() => mergeMessage(["bad\nmessage"], new Date("2026-07-29T18:07:59Z"))).toThrow();
});
