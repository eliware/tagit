import { buildNpmCommand } from "../../../src/registries/npm/command-builder.mjs";

const args = ["view", "demo@1.0.0", "version", "--json"];

test("builds a shell-free npm command on POSIX", () => {
  expect(buildNpmCommand(args, "linux")).toEqual({
    executable: "npm",
    args,
    options: { encoding: "utf8" },
  });
});

test("builds a Windows npm command with quoted arguments", () => {
  expect(buildNpmCommand(args, "win32")).toEqual({
    executable: 'npm.cmd "view" "demo@1.0.0" "version" "--json"',
    args: [],
    options: { encoding: "utf8", shell: true },
  });
});

test("uses the current platform when no platform is supplied", () => {
  expect(buildNpmCommand(args)).toEqual(
    process.platform === "win32"
      ? {
          executable: 'npm.cmd "view" "demo@1.0.0" "version" "--json"',
          args: [],
          options: { encoding: "utf8", shell: true },
        }
      : { executable: "npm", args, options: { encoding: "utf8" } },
  );
});
