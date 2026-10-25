import { parseUpstreamArguments } from "../../../../src/upstream/merge/arguments/parser.mjs";

test("extracts dry-run options from merge-message arguments", () => {
  const args = ["--dry-run", "sync", "mainline"];
  expect(parseUpstreamArguments(args)).toEqual({
    dryRun: true,
    messageArguments: ["sync", "mainline"],
  });
  expect(args).toEqual(["--dry-run", "sync", "mainline"]);
});

test("keeps ordinary merge-message arguments", () => {
  expect(parseUpstreamArguments(["sync", "mainline"])).toEqual({
    dryRun: false,
    messageArguments: ["sync", "mainline"],
  });
});

test("rejects non-array arguments and defaults missing arguments", () => {
  expect(() => parseUpstreamArguments("sync")).toThrow("must be an array");
  expect(parseUpstreamArguments()).toEqual({ dryRun: false, messageArguments: [] });
});
