import { parseUpstreamDryRunOption } from "../../../../src/upstream/merge/dry/run-option.mjs";

test("extracts the dry-run option from merge-message arguments", () => {
  const args = ["--dry-run", "sync", "mainline"];
  expect(parseUpstreamDryRunOption(args)).toEqual({
    dryRun: true,
    messageArguments: ["sync", "mainline"],
  });
  expect(args).toEqual(["--dry-run", "sync", "mainline"]);
});

test("keeps merge-message arguments when dry-run is absent", () => {
  expect(parseUpstreamDryRunOption(["sync", "mainline"])).toEqual({
    dryRun: false,
    messageArguments: ["sync", "mainline"],
  });
});
