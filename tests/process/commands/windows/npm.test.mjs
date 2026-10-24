import { buildWindowsNpmCommand } from "../../../../src/process/commands/windows/npm.mjs";

test("builds a Windows npm command with quoted arguments", () => {
  expect(buildWindowsNpmCommand(["view", "@eliware/test@8.0.0", "version", "--json"])).toEqual({
    executable: expect.stringMatching(/^npm\.cmd /),
    args: [],
    options: { encoding: "utf8", shell: true },
  });
});
