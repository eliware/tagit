import { parseUpstreamArguments } from "../../../src/upstream/merge/parse-arguments.mjs";

test("keeps ordinary merge-message arguments", () => {
  expect(parseUpstreamArguments(["sync", "mainline"])).toEqual({
    dryRun: false,
    messageArguments: ["sync", "mainline"],
  });
});

test("rejects non-array arguments", () => {
  expect(() => parseUpstreamArguments("sync")).toThrow("must be an array");
  expect(parseUpstreamArguments()).toEqual({ dryRun: false, messageArguments: [] });
});
