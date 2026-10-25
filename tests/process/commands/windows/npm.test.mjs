import { buildWindowsNpmCommand } from "../../../../src/process/commands/windows/npm.mjs";

test("builds a quoted Windows npm command with shell options", () => {
  expect(buildWindowsNpmCommand(["view", "@eliware/test@8.0.0", "version", "--json"])).toEqual({
    executable: 'npm.cmd "view" "@eliware/test@8.0.0" "version" "--json"',
    args: [],
    options: { encoding: "utf8", shell: true },
  });
});
