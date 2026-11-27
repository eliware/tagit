import buildPlatformNpmCommand from "../../../src/registries/npm/platform-command.mjs";
import buildWindowsNpmCommand from "../../../src/process/commands/windows/npm.mjs";

const args = ["view", "demo@1.0.0", "version", "--json"];

test("selects a shell-free npm command on POSIX", () => {
  expect(buildPlatformNpmCommand(args, "linux")).toEqual({
    executable: "npm",
    args,
    options: { encoding: "utf8" },
  });
});

test("selects the Windows invocation on Windows", () => {
  expect(buildPlatformNpmCommand(args, "win32")).toEqual(buildWindowsNpmCommand(args));
});

test("uses the current platform when no platform is supplied", () => {
  expect(buildPlatformNpmCommand(args)).toEqual(
    process.platform === "win32"
      ? buildWindowsNpmCommand(args)
      : { executable: "npm", args, options: { encoding: "utf8" } },
  );
});
