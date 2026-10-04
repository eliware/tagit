import { npmExecutable } from "../../../src/process/commands/npm-executable.mjs";

test("selects the platform npm executable", () => {
  expect(npmExecutable()).toBe(process.platform === "win32" ? "npm.cmd" : "npm");
  expect(npmExecutable("win32")).toBe("npm.cmd");
  expect(npmExecutable("linux")).toBe("npm");
});
