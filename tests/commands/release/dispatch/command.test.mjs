import { jest } from "@jest/globals";
import runReleaseCommand from "../../../../src/commands/release/dispatch/command.mjs";
import runTagit from "../../../../src/cli/application/run/tagit.mjs";
import packageData from "../../../../package.json" with { type: "json" };

const base = () => ({
  fs: { existsSync: jest.fn(() => false), readFileSync: jest.fn() },
  execFileSync: jest.fn(),
  execFile: jest.fn(),
  log: { info: jest.fn() },
  gitOperations: jest.fn(),
  runPreflight: jest.fn(() => ({ test: { passed: true } })),
  verifyRelease: jest.fn(),
  startReleaseVerification: jest.fn(),
});

test("requires an explicit release version", async () => {
  await expect(runReleaseCommand({ command: "release", version: null }, base())).rejects.toThrow(
    "exact release version",
  );
});

test("coordinates preflight output", async () => {
  const deps = base();
  const output = jest.fn();
  await runReleaseCommand({ command: "preflight" }, { ...deps, output });
  expect(output).toHaveBeenCalledWith(expect.stringContaining('"ok":true'));
});

test("coordinates latest-tag release wait", async () => {
  const deps = base();
  deps.execFileSync.mockImplementation((command, args) =>
    args[0] === "tag" ? "v1.2.3\n" : args[0] === "rev-list" ? "abc" : "tag-object",
  );
  await runReleaseCommand({ command: "release-wait", version: null }, deps);
  expect(deps.verifyRelease).toHaveBeenCalled();
});

test("does not require a release version for release-wait", async () => {
  const deps = base();
  deps.execFileSync.mockImplementation((command, args) =>
    args[0] === "tag" ? "v1.2.3\n" : args[0] === "rev-list" ? "abc" : "tag-object",
  );
  await expect(runReleaseCommand({ command: "release-wait" }, deps)).resolves.toBeUndefined();
});

test("runs the prepared release transaction and verifies its tag", async () => {
  const deps = base();
  deps.fs.existsSync.mockImplementation((file) => file === "package.json");
  deps.fs.readFileSync.mockReturnValue(JSON.stringify({ version: "1.2.3" }));
  deps.gitOperations.mockReturnValue({ commitSha: "abc", tag: "v1.2.3" });
  await runReleaseCommand({ command: "release", version: "1.2.3" }, deps);
  expect(deps.gitOperations).toHaveBeenCalledWith(
    expect.anything(),
    expect.anything(),
    expect.anything(),
    "1.2.3",
    {
      dryRun: undefined,
    },
  );
  expect(deps.startReleaseVerification).toHaveBeenCalledWith(
    expect.anything(),
    expect.anything(),
    expect.objectContaining({ version: "1.2.3" }),
  );
});

test("release dry-run validates the version without running preflight", async () => {
  const deps = base();
  deps.fs.existsSync.mockImplementation((file) => file === "package.json");
  deps.fs.readFileSync.mockReturnValue(JSON.stringify({ version: "1.2.3" }));
  await runReleaseCommand({ command: "release", version: "1.2.3", dryRun: true }, deps);
  expect(deps.runPreflight).not.toHaveBeenCalled();
  expect(deps.gitOperations).not.toHaveBeenCalled();
  expect(deps.startReleaseVerification).not.toHaveBeenCalled();
});

test("blocks a package version mismatch and skips tag creation", async () => {
  const deps = base();
  deps.fs.existsSync.mockImplementation((file) => file === "package.json");
  deps.fs.readFileSync.mockReturnValue(JSON.stringify({ version: "1.2.2" }));
  await expect(runReleaseCommand({ command: "release", version: "1.2.3" }, deps)).rejects.toThrow(
    "does not match",
  );
  expect(deps.gitOperations).not.toHaveBeenCalled();
});

test.each(["--ignore-100x4", "--ignore-monolith-limits"])(
  "CLI release rejects the removed validation option %s before preflight",
  async (option) => {
    const gitOperations = jest.fn();
    const runPreflight = jest.fn(() => ({ test: { passed: true } }));
    const exit = jest.fn();
    const log = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
    await expect(
      runTagit(
        {
          gitOperations,
          runPreflight,
          startReleaseVerification: jest.fn(),
          exit,
          log,
          registerHandlersFn: jest.fn(),
          registerSignalsFn: jest.fn(),
        },
        ["release", "--version", packageData.version, option],
      ),
    ).rejects.toThrow(`Unknown option: ${option}`);
    expect(runPreflight).not.toHaveBeenCalled();
    expect(gitOperations).not.toHaveBeenCalled();
    expect(exit).toHaveBeenCalledWith(1);
    expect(log.error).toHaveBeenCalledWith(`Unknown option: ${option}`);
  },
);

test("CLI release stops before git when preflight fails", async () => {
  const gitOperations = jest.fn();
  await expect(
    runTagit(
      {
        gitOperations,
        runPreflight: jest.fn(() => {
          throw new Error("preflight failed");
        }),
        log: { error: jest.fn() },
        exit: jest.fn(),
        registerHandlersFn: jest.fn(),
        registerSignalsFn: jest.fn(),
      },
      ["release", "--version", packageData.version],
    ),
  ).rejects.toThrow("preflight failed");
  expect(gitOperations).not.toHaveBeenCalled();
});
