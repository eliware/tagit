import { jest } from "@jest/globals";

const verifyNpmPublication = jest.fn(async () => {});
jest.unstable_mockModule("../../../../../src/registries/npm/verify-publication.mjs", () => ({
  verifyNpmPublication,
}));

const { verifyNpmRegistry } =
  await import("../../../../../src/commands/release-wait/verify/registries/npm-check.mjs");

beforeEach(() => jest.clearAllMocks());

test("reports npm verification and passes polling options", async () => {
  const log = { info: jest.fn() };
  const execFile = jest.fn();
  const sleep = jest.fn();
  await verifyNpmRegistry({
    execFile,
    log,
    packageName: "@eliware/demo",
    version: "1.0.0",
    retries: 3,
    retryMs: 10,
    sleep,
  });
  expect(log.info).toHaveBeenNthCalledWith(1, "Checking npm publication for @eliware/demo@1.0.0.");
  expect(log.info).toHaveBeenNthCalledWith(2, "npm verified: @eliware/demo@1.0.0.");
  expect(verifyNpmPublication).toHaveBeenCalledWith(execFile, log, {
    packageName: "@eliware/demo",
    version: "1.0.0",
    retries: 3,
    retryMs: 10,
    sleep,
  });
});

test("does not report npm success after a failed registry check", async () => {
  verifyNpmPublication.mockRejectedValue(new Error("not visible"));
  const log = { info: jest.fn() };
  await expect(
    verifyNpmRegistry({
      execFile: jest.fn(),
      log,
      packageName: "demo",
      version: "1.0.0",
      retries: 1,
      retryMs: 0,
      sleep: jest.fn(),
    }),
  ).rejects.toThrow("not visible");
  expect(log.info).toHaveBeenCalledTimes(1);
});
