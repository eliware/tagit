import { jest } from "@jest/globals";
import { mergeMessage } from "../../../../src/upstream/merge/message/build.mjs";

test("builds safe supplied or timestamp merge messages", () => {
  expect(mergeMessage(["merge"], new Date("2026-07-29T18:07:59Z"))).toBe("merge");
  expect(mergeMessage([], new Date("2026-07-29T18:07:59Z"))).toBe("2026-07-29 18:07:59");
});
test("uses the current time when all arguments are omitted", () =>
  expect(mergeMessage(undefined, new Date("2026-07-29T18:07:59Z"))).toBe("2026-07-29 18:07:59"));

test("uses the system time when no message or time is supplied", () => {
  jest.useFakeTimers({ now: new Date("2026-07-29T18:07:59Z") });
  expect(mergeMessage([])).toBe("2026-07-29 18:07:59");
  jest.useRealTimers();
});

test("rejects an unsafe merge message", () => {
  expect(() => mergeMessage(["bad\nmessage"], new Date("2026-07-29T18:07:59Z"))).toThrow();
});
