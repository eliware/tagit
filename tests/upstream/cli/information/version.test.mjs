import { jest } from "@jest/globals";
import { showUpstreamVersion } from "../../../../src/upstream/cli/information/version.mjs";

test("reads and prints the package version", () => {
  const packageJsonUrl = new URL("file:///tagit/package.json");
  const readFileSync = jest.fn(() => '{"version":"15.0.0"}');
  const log = { log: jest.fn() };
  showUpstreamVersion(readFileSync, packageJsonUrl, log);
  expect(readFileSync).toHaveBeenCalledWith(packageJsonUrl, "utf8");
  expect(log.log).toHaveBeenCalledWith("15.0.0");
});
