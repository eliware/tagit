import {
  getReleaseVersion,
  isHelp,
  parseOptions,
} from "../../../../src/cli/arguments/parse/options.mjs";

test("parses supported command and version results", () => {
  expect(isHelp(["--help"])).toBe(true);
  expect(isHelp(["preflight"])).toBe(false);
  expect(getReleaseVersion(["release", "--version", "1.2.3"])).toBe("1.2.3");
  expect(parseOptions(["release", "--version", "1.2.3"])).toMatchObject({
    command: "release",
    version: "1.2.3",
  });
  expect(parseOptions(["preflight", "--ignore-100x4", "--ignore-monolith-limits"])).toMatchObject({
    command: "preflight",
    ignore100x4: true,
    ignoreMonolithLimits: true,
  });
  expect(parseOptions(["--version"])).toMatchObject({ versionQuery: true });
  expect(parseOptions([])).toMatchObject({ command: undefined, versionQuery: false });
});
