import { buildWindowsNpmCommand } from "../../../src/registries/npm/windows-command.mjs";

test("builds a quoted npm command for Windows shims", () => {
  expect(buildWindowsNpmCommand(["view", "@eliware/test@8.0.0", "version", "--json"])).toEqual({
    executable: 'npm.cmd "view" "@eliware/test@8.0.0" "version" "--json"',
    args: [],
    options: { encoding: "utf8", shell: true },
  });
});
