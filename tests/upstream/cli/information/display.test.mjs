import { jest } from "@jest/globals";
import { showUpstreamInformation } from "../../../../src/upstream/cli/information/display.mjs";

test("shows selected help information", () => {
  const log = { log: jest.fn() };
  expect(showUpstreamInformation("help", { log })).toBe(true);
  expect(log.log).toHaveBeenCalledWith(expect.stringContaining("Usage: upstream"));
});

test("shows selected version information", () => {
  const log = { log: jest.fn() };
  const readFileSync = jest.fn(() => JSON.stringify({ version: "15.0.0" }));
  expect(showUpstreamInformation("version", { readFileSync, log })).toBe(true);
  expect(readFileSync).toHaveBeenCalledWith(expect.any(URL), "utf8");
  expect(log.log).toHaveBeenCalledWith("15.0.0");
});

test("does not handle normal command arguments", () => {
  expect(showUpstreamInformation(null, { log: { log: jest.fn() } })).toBe(false);
});
