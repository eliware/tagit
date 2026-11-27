import { jest } from "@jest/globals";
import dispatchCommand from "../../../../src/cli/application/dispatch/command.mjs";

const deps = () => ({
  packageVersion: "1.2.3",
  output: jest.fn(),
  log: { info: jest.fn(), error: jest.fn() },
  registerHandlersFn: jest.fn(),
  registerSignalsFn: jest.fn(),
  fs: {},
  execFileSync: jest.fn(),
  buildNotesReport: jest.fn(() => "notes"),
  reportCiLinks: jest.fn(),
  exit: jest.fn(),
  runPreflight: jest.fn(),
  gitOperations: jest.fn(),
  verifyRelease: jest.fn(),
  execFile: jest.fn(),
});
test("handles help at the command boundary", async () => {
  const help = deps();
  await dispatchCommand({ help: true }, help);
  expect(help.output).toHaveBeenCalledWith(expect.stringContaining("Project owners may run only"));
});

test("uses console output when no output override is supplied", async () => {
  const original = console.log;
  console.log = jest.fn();
  try {
    await dispatchCommand({ help: true }, { ...deps(), output: undefined });
    expect(console.log).toHaveBeenCalled();
  } finally {
    console.log = original;
  }
});

test("dispatches simple and preflight commands", async () => {
  const notes = deps();
  await dispatchCommand({ command: "notes" }, notes);
  expect(notes.buildNotesReport).toHaveBeenCalled();

  const push = deps();
  await dispatchCommand({ command: "push", dryRun: true }, push);
  expect(push.execFileSync).not.toHaveBeenCalled();

  const preflight = deps();
  preflight.runPreflight = jest.fn();
  await dispatchCommand({ command: "preflight" }, preflight);
  expect(preflight.runPreflight).toHaveBeenCalled();

  const noCommand = deps();
  await dispatchCommand({}, noCommand);
  expect(noCommand.output).toHaveBeenCalledWith(
    expect.stringContaining("Project owners may run only"),
  );
});
