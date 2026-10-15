import { jest } from "@jest/globals";
import { runPreflight } from "../../../src/validation/preflight/run-checks.mjs";
const packageFs = (
  packageJson = {
    name: "demo",
    scripts: { test: "eliware-test" },
    devDependencies: { "@eliware/test": "^4.0.0" },
  },
) => ({
  lstatSync: () => ({ isSymbolicLink: () => false }),
  existsSync: jest.fn(
    (file) => file === "package.json" || file === "node_modules/@eliware/test/package.json",
  ),
  readFileSync: jest.fn((file) =>
    file === "node_modules/@eliware/test/package.json"
      ? JSON.stringify({ name: "@eliware/test", version: "4.1.0" })
      : JSON.stringify(packageJson),
  ),
});

const isNodeNpm = (executable, args = []) =>
  executable === "npm" ||
  executable === "npm.cmd" ||
  (executable === "cmd.exe" && args.includes("npm.cmd"));
test("preflight delegates local validation to the project test script", () => {
  const execSync = jest.fn((executable, args) => {
    if (isNodeNpm(executable, args) && args.at(-1) === "test")
      return "All files     100     100     100     100";
    return "";
  });
  const fs = {
    lstatSync: () => ({ isSymbolicLink: () => false }),
    existsSync: jest.fn(
      (file) => file === "package.json" || file === "node_modules/@eliware/test/package.json",
    ),
    readFileSync: jest.fn((file) =>
      file === "node_modules/@eliware/test/package.json"
        ? JSON.stringify({ name: "@eliware/test", version: "4.1.0" })
        : JSON.stringify({
            name: "demo",
            scripts: { test: "eliware-test", audit: "audit" },
            devDependencies: { "@eliware/test": "^4.0.0" },
          }),
    ),
  };
  const log = { info: jest.fn() };
  const result = runPreflight(execSync, fs, log);
  expect(result.test.passed).toBe(true);
  expect(
    execSync.mock.calls.filter(
      ([executable, args]) => isNodeNpm(executable, args) && args.at(-1) === "test",
    ),
  ).toHaveLength(1);
});
test("preflight rejects dirty trees before running package commands", () => {
  const execSync = jest.fn(() => " M package.json\n");
  const fs = packageFs();

  expect(() => runPreflight(execSync, fs, { info: jest.fn() })).toThrow(
    "uncommitted changes are present",
  );
  expect(execSync).toHaveBeenCalledTimes(2);
});

test("strict preflight delegates repository validation", () => {
  const pkg = {
    repository: { url: "https://github.com/eliware/demo" },
    devDependencies: { "@eliware/test": "^3.0.0" },
    scripts: { test: "eliware-test", lint: "eliware-test --lint" },
  };
  const exec = jest.fn((command, args) =>
    args[0] === "status"
      ? ""
      : args[0] === "branch"
        ? "main"
        : args[0] === "remote"
          ? "https://github.com/eliware/demo.git"
          : "",
  );
  const fs = {
    existsSync: () => true,
    lstatSync: () => ({ isSymbolicLink: () => false }),
    readFileSync: (file) =>
      file === "node_modules/@eliware/test/package.json"
        ? JSON.stringify({ name: "@eliware/test", version: "3.3.0" })
        : JSON.stringify(pkg),
  };
  expect(runPreflight(exec, fs, { info: jest.fn() }, { strictRepository: true })).toHaveProperty(
    "test.passed",
    true,
  );
});

test("preflight blocks CI evidence when the worktree is dirty", () => {
  const execSync = jest.fn((executable, args) =>
    executable === "git" && args[0] === "status" ? " M file.js\n" : "",
  );
  const fs = { existsSync: jest.fn(() => false) };
  expect(() => runPreflight(execSync, fs, { info: jest.fn() }, { verifyCi: true })).toThrow(
    "uncommitted changes are present",
  );
});

test("preflight reports an exact-HEAD CI verification error", () => {
  const exec = jest.fn((command, args) => {
    if (args[0] === "status") return "";
    if (args[0] === "rev-parse") throw new Error("CI unavailable");
    return "";
  });
  expect(() => runPreflight(exec, packageFs(), { info: jest.fn() }, { verifyCi: true })).toThrow(
    "GitHub CI verification failed",
  );
});

test("preflight accepts the shared harness result with the explicit waiver", () => {
  const execSync = jest.fn((executable, args) =>
    executable === "git" && args[0] === "status" ? "" : "not 100x4",
  );
  const fs = packageFs();
  expect(runPreflight(execSync, fs, { info: jest.fn() }, { ignore100x4: true })).toHaveProperty(
    "test.passed",
    true,
  );
  expect(execSync.mock.calls.some(([executable, args]) => isNodeNpm(executable, args))).toBe(true);
});

test("preflight does not parse or duplicate the shared harness coverage result", () => {
  const execSync = jest.fn(() => "");
  const fs = packageFs();
  expect(runPreflight(execSync, fs, { info: jest.fn() })).toHaveProperty("test.passed", true);
});
