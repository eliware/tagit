import { jest } from "@jest/globals";
import { readCiRunsWithRetry } from "../../../../src/github/links/report-ci/retry-policy.mjs";

test("retries exact-head lookups until a run appears", () => {
  let lookups = 0;
  const waitSync = jest.fn();
  const exec = jest.fn((_command, args) =>
    args[1] === "list"
      ? ++lookups < 3
        ? "[]"
        : JSON.stringify([{ databaseId: 7, headSha: "abc", url: "https://ci/7" }])
      : JSON.stringify({ jobs: [] }),
  );
  const log = { info: jest.fn() };
  expect(
    readCiRunsWithRetry(exec, log, "eliware/tagit", "abc", {
      attempts: 3,
      delayMs: 250,
      waitSync,
    }),
  ).toEqual([{ databaseId: 7, headSha: "abc", url: "https://ci/7" }]);
  expect(waitSync).toHaveBeenCalledTimes(2);
  expect(waitSync).toHaveBeenCalledWith(250);
  expect(log.info).not.toHaveBeenCalled();
});

test("reports when no run appears before attempts end", () => {
  const exec = jest.fn(() => "[]");
  const log = { info: jest.fn() };
  expect(
    readCiRunsWithRetry(exec, log, "eliware/tagit", "abc", {
      attempts: 1,
      delayMs: 0,
      waitSync: jest.fn(),
    }),
  ).toEqual([]);
  expect(log.info).toHaveBeenCalledWith("No CI run exists for abc at this time.");
});
