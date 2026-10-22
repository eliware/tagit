import { buildNpmViewCommand } from "../../../src/registries/npm/build-view-command.mjs";

test("builds a shell-free npm view command on POSIX", () => {
  expect(buildNpmViewCommand("demo", "1.0.0", "linux")).toEqual({
    executable: "npm",
    args: ["view", "demo@1.0.0", "version", "--json"],
    options: { encoding: "utf8" },
  });
});

test("builds a command from the supplied package and version", () => {
  expect(buildNpmViewCommand("bad name", "not-a-version", "linux")).toEqual({
    executable: "npm",
    args: ["view", "bad name@not-a-version", "version", "--json"],
    options: { encoding: "utf8" },
  });
});
