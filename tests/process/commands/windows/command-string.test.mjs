import { buildWindowsNpmCommandString } from "../../../../src/process/commands/windows/command-string.mjs";

test("quotes each Windows npm argument", () => {
  expect(buildWindowsNpmCommandString(["view", "@eliware/test@8.0.0", "version", "--json"])).toBe(
    'npm.cmd "view" "@eliware/test@8.0.0" "version" "--json"',
  );
});
