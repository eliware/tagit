import { jest } from "@jest/globals";
import { handleUpstreamDryRun } from "../../../src/upstream/merge/command-policy.mjs";

test("reports the dry-run plan without running a merge", () => {
  const exec = jest.fn(() => "upstream/main");
  const log = { log: jest.fn() };
  expect(handleUpstreamDryRun(exec, log, true, "sync")).toBe(true);
  expect(log.log).toHaveBeenCalledWith(
    'Dry run: can fetch upstream, merge upstream/main with message "sync", then push.',
  );
});

test("does nothing when the dry-run option is absent", () => {
  const exec = jest.fn();
  expect(handleUpstreamDryRun(exec, { log: jest.fn() }, false, "sync")).toBe(false);
  expect(exec).not.toHaveBeenCalled();
});
