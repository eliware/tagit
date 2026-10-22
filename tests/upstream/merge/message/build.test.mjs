import { mergeMessage } from "../../../../src/upstream/merge/message/build.mjs";

test("builds safe supplied or timestamp merge messages", () => {
  expect(mergeMessage(["merge"])).toBe("merge");
  expect(mergeMessage([], new Date("2026-07-29T18:07:59Z"))).toBe("2026-07-29 18:07:59");
});
test("uses the current time when all arguments are omitted", () =>
  expect(mergeMessage(undefined, new Date("2026-07-29T18:07:59Z"))).toBe("2026-07-29 18:07:59"));
