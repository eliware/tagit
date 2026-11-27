import { jest } from "@jest/globals";

const mergeMessage = jest.fn((args) => args.join(" "));
const createDefaultMergeMessage = jest.fn(() => "default message");
jest.unstable_mockModule("../../../../src/upstream/merge/message/build.mjs", () => ({
  default: mergeMessage,
}));
jest.unstable_mockModule("../../../../src/upstream/merge/message/default.mjs", () => ({
  default: createDefaultMergeMessage,
}));
const { default: readMergeMessage } =
  await import("../../../../src/upstream/merge/message/reader.mjs");

beforeEach(() => jest.clearAllMocks());

test("uses the default builder when message arguments are omitted", () => {
  expect(readMergeMessage([], new Date("2026-07-29T18:07:59Z"))).toBe("default message");
  expect(createDefaultMergeMessage).toHaveBeenCalledWith(new Date("2026-07-29T18:07:59Z"));
  expect(mergeMessage).not.toHaveBeenCalled();
});

test("uses the supplied message builder when arguments are present", () => {
  expect(readMergeMessage(["merge", "upstream"])).toBe("merge upstream");
  expect(mergeMessage).toHaveBeenCalledWith(["merge", "upstream"]);
  expect(createDefaultMergeMessage).not.toHaveBeenCalled();
});
