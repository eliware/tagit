import { jest } from "@jest/globals";
import { showUpstreamInformation } from "../../../src/upstream/cli/information.mjs";

test("shows selected help information", () => {
  const log = { log: jest.fn() };
  expect(showUpstreamInformation(["--help"], { log }, new URL("file:///package.json"))).toBe(true);
  expect(log.log).toHaveBeenCalledWith(expect.stringContaining("Usage: upstream"));
});

test("shows selected version information", () => {
  const log = { log: jest.fn() };
  const readFileSync = jest.fn(() => JSON.stringify({ version: "15.0.0" }));
  const packageJsonUrl = new URL("file:///package.json");
  expect(showUpstreamInformation(["--version"], { readFileSync, log }, packageJsonUrl)).toBe(true);
  expect(readFileSync).toHaveBeenCalledWith(packageJsonUrl, "utf8");
  expect(log.log).toHaveBeenCalledWith("15.0.0");
});

test("does not handle normal command arguments", () => {
  expect(
    showUpstreamInformation(
      ["merge"],
      { log: { log: jest.fn() } },
      new URL("file:///package.json"),
    ),
  ).toBe(false);
});
