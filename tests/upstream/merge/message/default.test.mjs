import { jest } from "@jest/globals";
import { createDefaultMergeMessage } from "../../../../src/upstream/merge/message/default.mjs";

test("formats a supplied time as the default merge message", () => {
  expect(createDefaultMergeMessage(new Date("2026-07-29T18:07:59Z"))).toBe("2026-07-29 18:07:59");
});

test("uses the system time when no time is supplied", () => {
  jest.useFakeTimers({ now: new Date("2026-07-29T18:07:59Z") });
  expect(createDefaultMergeMessage()).toBe("2026-07-29 18:07:59");
  jest.useRealTimers();
});
