import { jest } from "@jest/globals";
import { processCommand } from "../../../src/validation/local/process-command.mjs";
import { runLocalChecks } from "../../../src/validation/preflight/run-local-checks.mjs";

const fs = {
  lstatSync: () => ({ isSymbolicLink: () => false }),
  existsSync: (file) =>
    file === "package.json" || file === "node_modules/@eliware/test/package.json",
  readFileSync: (file) =>
    file === "node_modules/@eliware/test/package.json"
      ? JSON.stringify({ name: "@eliware/test", version: "4.1.0" })
      : JSON.stringify({
          name: "demo",
          scripts: { test: "eliware-test" },
          devDependencies: { "@eliware/test": "^4.0.0" },
        }),
};

test("runs the declared shared test command", () => {
  const run = jest.fn();
  expect(runLocalChecks(run, fs).results.test).toEqual({ passed: true });
  expect(run).toHaveBeenCalledTimes(1);
  expect(run.mock.calls[0][1].at(-1)).toBe("test");
});

test("uses the shell-free npm runner", () => {
  const run = jest.fn();
  runLocalChecks(run, fs);
  expect(run).toHaveBeenCalledWith(...processCommand("npm", ["test"]), {
    stdio: "pipe",
    timeout: 120000,
    ...(processCommand("npm", ["test"])[0] === "cmd.exe" ? { windowsVerbatimArguments: true } : {}),
  });
});

test("reports a failed local command with captured output", () => {
  const run = jest.fn(() => {
    throw { stdout: "failed test output", stderr: "" };
  });
  const result = runLocalChecks(run, fs);
  expect(result.results.test).toEqual({ passed: false });
  expect(result.failures.join("\n")).toContain("failed test output");
});

test.each([
  [new Error("silent failure"), "no output captured"],
  [{ stdout: "x".repeat(5000), stderr: "" }, "output truncated"],
  [Object.assign(new Error("timed out"), { code: "ETIMEDOUT" }), "exceeded the 120-second limit"],
])("formats local test failure details", (error, expected) => {
  const run = jest.fn(() => {
    throw error;
  });
  expect(runLocalChecks(run, fs).failures.join("\n")).toContain(expected);
});

test("blocks packages without a test script", () => {
  const packageFs = {
    existsSync: (file) => file === "package.json",
    readFileSync: () => JSON.stringify({ scripts: {} }),
  };
  expect(runLocalChecks(jest.fn(), packageFs).failures.join("\n")).toContain(
    "does not declare scripts.test",
  );
});

test("blocks named packages without an installed shared harness", () => {
  const packageFs = {
    existsSync: () => true,
    lstatSync: () => ({ isSymbolicLink: () => false }),
    readFileSync: () => JSON.stringify({ name: "demo", scripts: { test: "eliware-test" } }),
  };
  expect(runLocalChecks(jest.fn(), packageFs).failures.join("\n")).toContain(
    "installed, non-linked @eliware/test",
  );
});
