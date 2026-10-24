import { jest } from "@jest/globals";
import {
  selectInformationOption,
  showUpstreamInformation,
} from "../../../src/upstream/cli/information.mjs";

test.each([
  ["--help", "help"],
  ["-h", "help"],
  ["--version", "version"],
  ["-v", "version"],
])("selects the information action for %s", (argument, expected) => {
  expect(selectInformationOption([argument])).toBe(expected);
});

test("prefers help when help and version options appear together", () => {
  expect(selectInformationOption(["--version", "--help"])).toBe("help");
});

test("returns no information action for command arguments", () => {
  expect(selectInformationOption(["merge", "message"])).toBeNull();
});

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
