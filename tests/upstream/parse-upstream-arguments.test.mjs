import { parseUpstreamArguments } from "../../src/upstream/parse-upstream-arguments.mjs";

test("separates dry-run mode from merge-message arguments", () => {
  const args = ["--dry-run", "sync", "mainline"];
  const parsed = parseUpstreamArguments(args);
  expect(parsed).toEqual({ dryRun: true, messageArguments: ["sync", "mainline"] });
  expect(parsed.messageArguments).not.toBe(args);
  expect(args).toEqual(["--dry-run", "sync", "mainline"]);
});

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
