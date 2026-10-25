import { jest } from "@jest/globals";
import { showUpstreamHelp } from "../../../../src/upstream/cli/information/help.mjs";

test("prints upstream command help", () => {
  const log = { log: jest.fn() };
  showUpstreamHelp(log);
  expect(log.log).toHaveBeenCalledWith(
    "Usage: upstream [--dry-run] [merge-message...]\nFetch upstream, merge its default branch, and push the result.",
  );
});
