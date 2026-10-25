import { jest } from "@jest/globals";
import { dispatchUpstreamInformation } from "../../../../src/upstream/cli/information/dispatch.mjs";

test("dispatches selected help information", () => {
  const log = { log: jest.fn() };
  expect(dispatchUpstreamInformation(["--help"], { log })).toBe(true);
  expect(log.log).toHaveBeenCalledWith(expect.stringContaining("Usage: upstream"));
});

test("dispatches selected version information", () => {
  const log = { log: jest.fn() };
  const readFileSync = jest.fn(() => JSON.stringify({ version: "15.0.0" }));
  expect(dispatchUpstreamInformation(["--version"], { readFileSync, log })).toBe(true);
  expect(readFileSync).toHaveBeenCalledWith(expect.any(URL), "utf8");
  expect(log.log).toHaveBeenCalledWith("15.0.0");
});

test("does not handle normal command arguments", () => {
  const log = { log: jest.fn() };
  const readFileSync = jest.fn();
  expect(dispatchUpstreamInformation(["merge", "message"], { readFileSync, log })).toBe(false);
  expect(readFileSync).not.toHaveBeenCalled();
  expect(log.log).not.toHaveBeenCalled();
});
