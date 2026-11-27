import parseOptions from "../../../../src/cli/arguments/parse/options.mjs";
import isHelp from "../../../../src/cli/arguments/parse/is-help.mjs";

test("parses supported command and version results", () => {
  expect(isHelp(["--help"])).toBe(true);
  expect(isHelp(["preflight"])).toBe(false);
  expect(parseOptions(["release", "--version", "1.2.3"])).toMatchObject({
    command: "release",
    version: "1.2.3",
  });
  expect(parseOptions(["--version"])).toMatchObject({ versionQuery: true });
  expect(parseOptions([])).toMatchObject({ command: undefined, versionQuery: false });
});

test.each([
  ["preflight", "--ignore-100x4"],
  ["preflight", "--ignore-monolith-limits"],
  ["release", "--ignore-100x4"],
  ["release", "--ignore-monolith-limits"],
])("rejects removed validation options for %s", (command, option) => {
  expect(() =>
    parseOptions([command, ...(command === "release" ? ["--version", "1.2.3"] : []), option]),
  ).toThrow(`Unknown option: ${option}`);
});
