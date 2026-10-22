import { jest } from "@jest/globals";
import { reportUpstreamDryRun } from "../../../src/upstream/merge/dry-run.mjs";

test("reports the upstream merge plan", () => {
  const log = { log: jest.fn() };
  reportUpstreamDryRun(log, "upstream/main", "sync updates");
  expect(log.log).toHaveBeenCalledWith(
    'Dry run: can fetch upstream, merge upstream/main with message "sync updates", then push.',
  );
});
