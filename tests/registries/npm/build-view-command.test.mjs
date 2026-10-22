import { buildNpmViewArguments } from "../../../src/registries/npm/build-view-command.mjs";

test("builds npm view arguments from the package and version", () => {
  expect(buildNpmViewArguments("demo", "1.0.0")).toEqual([
    "view",
    "demo@1.0.0",
    "version",
    "--json",
  ]);
});

test("builds a command from the supplied package and version", () => {
  expect(buildNpmViewArguments("bad name", "not-a-version")).toEqual([
    "view",
    "bad name@not-a-version",
    "version",
    "--json",
  ]);
});
