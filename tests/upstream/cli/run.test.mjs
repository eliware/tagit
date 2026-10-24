import { jest } from "@jest/globals";
import { runUpstreamCli } from "../../../src/upstream/cli/run.mjs";

function dependencies() {
  return {
    execFileSync: jest.fn(),
    readFileSync: jest.fn(() => JSON.stringify({ version: "15.0.0" })),
    now: new Date("2026-10-22T00:00:00.000Z"),
    log: { log: jest.fn() },
    runUpstream: jest.fn(),
  };
}

test("dispatches help display for a help option", () => {
  const deps = dependencies();
  runUpstreamCli(["--help"], deps);
  expect(deps.log.log).toHaveBeenCalledWith(expect.stringContaining("Usage: upstream"));
  expect(deps.runUpstream).not.toHaveBeenCalled();
});

test("dispatches version display for a version option", () => {
  const deps = dependencies();
  runUpstreamCli(["--version"], deps);
  expect(deps.readFileSync).toHaveBeenCalledWith(expect.any(URL), "utf8");
  expect(deps.log.log).toHaveBeenCalledWith("15.0.0");
  expect(deps.runUpstream).not.toHaveBeenCalled();
});

test("runs the upstream command for normal arguments", () => {
  const deps = dependencies();
  expect(runUpstreamCli(["merge", "Release"], deps)).toBeUndefined();
  expect(deps.runUpstream).toHaveBeenCalledWith(
    ["merge", "Release"],
    deps.execFileSync,
    deps.now,
    deps.log,
  );
});
