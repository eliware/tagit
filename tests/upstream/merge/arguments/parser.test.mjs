import parseUpstreamArguments from "../../../../src/upstream/merge/arguments/parser.mjs";

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

test.each(["sync", "mainline"])("rejects --dry-run after merge text %s", (message) => {
  expect(() => parseUpstreamArguments([message, "--dry-run"])).toThrow(
    "must appear before the merge message",
  );
});

test("rejects unknown option-like merge arguments", () => {
  expect(() => parseUpstreamArguments(["--dru-run", "sync"])).toThrow(
    "Unknown upstream option: --dru-run",
  );
});

test("rejects a repeated dry-run option", () => {
  expect(() => parseUpstreamArguments(["--dry-run", "--dry-run"])).toThrow(
    "cannot appear more than once",
  );
});
