import * as cli from "../../../src/cli/application/public-api.mjs";

test("exports the public CLI helpers", () => {
  expect(Object.keys(cli).sort()).toEqual([
    "helpText",
    "isCli",
    "isHelp",
    "parseOptions",
    "preflightGuide",
    "releaseGuide",
  ]);
  expect(cli.helpText()).toContain("Usage: tagit");
  expect(cli.isHelp(["--help"])).toBe(true);
  expect(cli.parseOptions(["preflight"]).command).toBe("preflight");
  expect(cli.preflightGuide()).toContain("Preflight");
  expect(cli.releaseGuide()).toContain("Release");
  expect(cli.isCli(["node", "tagit"])).toBe(true);
});
