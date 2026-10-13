import { jest } from "@jest/globals";
import { execFileSync } from "node:child_process";
import { runTagit } from "../../../src/cli/application/run-tagit.mjs";
import packageData from "../../../package.json" with { type: "json" };

const noop = jest.fn();
const log = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
const testArgv = process.argv;
beforeAll(() => {
  process.argv = ["node", "tagit"];
});
afterAll(() => {
  process.argv = testArgv;
});

test("runs the public CLI help entry point from the repository root", () => {
  const output = execFileSync(process.execPath, ["bin/tagit-cli.mjs", "--help"], {
    encoding: "utf8",
  });
  expect(output).toContain("Usage: tagit");
});
test("runs the notes entry point with injected dependencies", async () => {
  const output = jest.fn();
  const buildNotesReport = jest.fn(() => "TAGIT NOTES REPORT");
  const gitOperations = jest.fn();
  await runTagit(
    {
      output,
      buildNotesReport,
      gitOperations,
      suggestVersion: noop,
      log,
      registerHandlersFn: noop,
      registerSignalsFn: noop,
    },
    ["notes"],
  );
  expect(buildNotesReport).toHaveBeenCalledWith(expect.anything(), expect.anything());
  expect(gitOperations).not.toHaveBeenCalled();
  expect(output).toHaveBeenCalledWith("TAGIT NOTES REPORT");
});
test("uses console output for default version and preflight responses", async () => {
  const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  await runTagit({}, ["-v"]);
  expect(consoleSpy).toHaveBeenCalledWith(packageData.version);
  await runTagit(
    {
      runPreflight: jest.fn(() => ({ test: { passed: true } })),
      suggestVersion: noop,
      log,
      registerHandlersFn: noop,
      registerSignalsFn: noop,
    },
    ["preflight"],
  );
  expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('"ok":true'));
  consoleSpy.mockRestore();
});
test("preflight runs without release side effects", async () => {
  const output = jest.fn();
  const runPreflight = jest.fn(() => ({ test: { passed: true } }));
  const updateVersionFiles = jest.fn();
  await runTagit(
    {
      output,
      runPreflight,
      updateVersionFiles,
      suggestVersion: noop,
      log,
      registerHandlersFn: noop,
      registerSignalsFn: noop,
    },
    ["preflight"],
  );
  expect(runPreflight).toHaveBeenCalled();
  expect(updateVersionFiles).not.toHaveBeenCalled();
  expect(output).toHaveBeenCalledWith(
    JSON.stringify({ ok: true, checks: { test: { passed: true } } }),
  );
});
test("passes the explicit coverage waiver to preflight", async () => {
  const runPreflight = jest.fn(() => ({ test: { passed: true } }));
  await runTagit(
    { output: jest.fn(), runPreflight, log, registerHandlersFn: noop, registerSignalsFn: noop },
    ["preflight", "--ignore-100x4"],
  );
  expect(runPreflight).toHaveBeenCalledWith(
    expect.anything(),
    expect.anything(),
    log,
    expect.objectContaining({ ignore100x4: true }),
  );
});
test("notes uses console output when no output override is supplied", async () => {
  const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  await runTagit(
    {
      buildNotesReport: jest.fn(() => "report"),
      suggestVersion: noop,
      log,
      registerHandlersFn: noop,
      registerSignalsFn: noop,
    },
    ["notes"],
  );
  expect(consoleSpy).toHaveBeenCalledWith("report");
  consoleSpy.mockRestore();
});
test("uses default dependencies and argv at the public boundary", async () => {
  const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  try {
    await runTagit();
  } finally {
    consoleSpy.mockRestore();
  }
});
