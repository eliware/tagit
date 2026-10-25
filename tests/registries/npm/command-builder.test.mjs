import { buildNpmCommand } from "../../../src/registries/npm/command-builder.mjs";
import { buildWindowsNpmCommand } from "../../../src/process/commands/windows/npm.mjs";

const args = ["view", "demo@1.0.0", "version", "--json"];

test("builds a shell-free npm command on POSIX", () => {
  expect(buildNpmCommand(args, "linux")).toEqual({
    executable: "npm",
    args,
    options: { encoding: "utf8" },
  });
});

test("selects the Windows npm command when the platform is Windows", () => {
  expect(buildNpmCommand(args, "win32")).toEqual(buildWindowsNpmCommand(args));
});

test("uses the current platform when no platform is supplied", () => {
  const expected =
    process.platform === "win32"
      ? buildWindowsNpmCommand(args)
      : { executable: "npm", args, options: { encoding: "utf8" } };
  expect(buildNpmCommand(args)).toEqual(expected);
});
