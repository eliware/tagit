import { isCli } from "../../../src/cli/application/is-cli.mjs";
test("recognizes supported executable names", () => {
  expect(isCli(["node", "tagit"])).toBe(true);
  expect(isCli(["node", "tagit.mjs"])).toBe(true);
  expect(isCli(["node", "push-cli.mjs"])).toBe(true);
  expect(isCli(["node", "upstream-cli.mjs"])).toBe(true);
  expect(isCli(["node", "tagit-cli.mjs"])).toBe(true);
  expect(isCli(["node", "other.mjs"])).toBe(false);
  expect(isCli(["node"])).toBe(false);
  expect(isCli(["node", "/opt/tagit/bin/tagit.mjs"])).toBe(true);
  expect(isCli(["node", "/opt/test.mjs"])).toBe(false);
});
