import { buildNpmViewCommand } from "../../../src/registries/npm/build-view-command.mjs";

test("builds a shell-free npm view command on POSIX", () => {
  expect(buildNpmViewCommand("demo", "1.0.0", "linux")).toEqual({
    executable: "npm",
    args: ["view", "demo@1.0.0", "version", "--json"],
    options: { encoding: "utf8" },
  });
});

test("builds a quoted npm command for Windows shims", () => {
  expect(buildNpmViewCommand("@eliware/test", "8.0.0", "win32")).toEqual({
    executable: 'npm.cmd "view" "@eliware/test@8.0.0" "version" "--json"',
    args: [],
    options: { encoding: "utf8", shell: true },
  });
});
