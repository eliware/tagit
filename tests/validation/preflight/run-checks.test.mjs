import { jest } from "@jest/globals";
import { processCommand } from "../../../src/validation/local/process-command.mjs";
import { runPreflight } from "../../../src/validation/preflight/run-checks.mjs";
const packageFs = (packageJson = { scripts: { test: "eliware-test" } }) => ({
  existsSync: jest.fn((file) => file === "package.json"),
  readFileSync: jest.fn(() => JSON.stringify(packageJson)),
});

const isNodeNpm = (executable, args = []) =>
  executable === "npm" ||
  executable === "npm.cmd" ||
  (executable === "cmd.exe" && args.includes("npm.cmd"));
const expectNpmCall = (mock, expectedArgs) =>
  expect(
    mock.mock.calls.some(
      ([executable, args]) =>
        isNodeNpm(executable, args) && expectedArgs.every((arg) => args.includes(arg)),
    ),
  ).toBe(true);

test("preflight delegates local validation to the project test script", () => {
  const execSync = jest.fn((executable, args) => {
    if (isNodeNpm(executable, args) && args.at(-1) === "test")
      return "All files     100     100     100     100";
    return "";
  });
  const fs = {
    existsSync: jest.fn((file) => file === "package.json"),
    readFileSync: jest.fn(() =>
      JSON.stringify({ scripts: { test: "eliware-test", audit: "audit" } }),
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
test("preflight blocks projects without a test script", () => {
  const execFileSync = jest.fn(() => "");
  const fs = {
    existsSync: jest.fn((file) => file === "package.json"),
    readFileSync: jest.fn(() => JSON.stringify({ scripts: {} })),
  };
  expect(() => runPreflight(execFileSync, fs, { info: jest.fn() })).toThrow(
    "does not declare scripts.test",
  );
});

test("preflight blocks a named project without the installed shared harness", () => {
  const fs = {
    existsSync: () => true,
    lstatSync: (file) => ({
      isDirectory: () => ["docs/", "specs/"].includes(file),
      isSymbolicLink: () => false,
    }),
    readFileSync: () => JSON.stringify({ name: "demo", scripts: { test: "eliware-test" } }),
  };
  expect(() =>
    runPreflight(
      jest.fn(() => ""),
      fs,
      { info: jest.fn() },
    ),
  ).toThrow("installed, non-linked @eliware/test");
});

test("uses the injected shell-free runner for local checks", () => {
  const execFileSync = jest.fn((executable, args) =>
    args[0] === "status" ? "" : "All files | 100 | 100 | 100 | 100 |",
  );
  const fs = packageFs();
  const result = runPreflight(execFileSync, fs, { info: jest.fn() });
  expect(result.test.passed).toBe(true);
  expectNpmCall(execFileSync, ["test"]);
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
  const workflow =
    "on:\n  push:\n    branches:\n      - main\n  pull_request:\njobs:\n  test:\n    steps:\n      - uses: actions/checkout@v6\n      - uses: actions/setup-node@v7\n      - run: npm -g install npm@latest\n      - run: npm ci\n      - run: npm test";
  const pkg = {
    name: "demo",
    version: "1.0.0",
    description: "demo",
    keywords: ["demo"],
    author: "Eli",
    repository: { url: "https://github.com/eliware/demo" },
    homepage: "https://github.com/eliware/demo",
    license: "MIT",
    engines: { node: ">=26" },
    devDependencies: { "@eliware/test": "^3.0.0" },
    scripts: { test: "eliware-test", lint: "eliware-test --lint" },
    exports: { ".": "./index.mjs" },
    files: ["README.md", "LICENSE", "RELEASE_NOTES.md"],
    publishConfig: { access: "public", provenance: true },
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
    lstatSync: (file) => ({
      isDirectory: () => ["docs/", "specs/"].includes(file),
      isSymbolicLink: () => false,
    }),
    readFileSync: (file) =>
      file === "node_modules/@eliware/test/package.json"
        ? JSON.stringify({ name: "@eliware/test", version: "3.3.0" })
        : file === ".tagit-exceptions.json"
          ? '{"inapplicable":{}}'
          : file === "RELEASE_NOTES.md"
            ? "## 1.0.0"
            : file === ".github/workflows/ci.yaml"
              ? workflow
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
  const npmCalls = execSync.mock.calls.filter(([executable, args]) => isNodeNpm(executable, args));
  expect(npmCalls).toHaveLength(1);
  expect(npmCalls[0][1]).toEqual(processCommand("npm", ["test", "--", "--ignore-100x4"])[1]);
});

test("preflight does not parse or duplicate the shared harness coverage result", () => {
  const execSync = jest.fn(() => "");
  const fs = packageFs();
  expect(runPreflight(execSync, fs, { info: jest.fn() })).toHaveProperty("test.passed", true);
});
