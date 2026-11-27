import { jest } from "@jest/globals";

const verifyNpmRegistry = jest.fn();
jest.unstable_mockModule(
  "../../../../../src/commands/release-wait/verify/registries/npm-check.mjs",
  () => ({ default: verifyNpmRegistry }),
);
const { default: verifyRegistryNpmCheck } =
  await import("../../../../../src/commands/release-wait/verify/registry/npm-check.mjs");

beforeEach(() => jest.clearAllMocks());

const options = {
  npm: true,
  execFile: jest.fn(),
  log: { info: jest.fn() },
  packageName: "demo",
  version: "1.0.0",
  npmRetries: 3,
  npmRetryMs: 10,
  sleep: jest.fn(),
};

test("checks npm and returns its result", async () => {
  await expect(verifyRegistryNpmCheck(options)).resolves.toEqual({ npm: true });
  expect(verifyNpmRegistry).toHaveBeenCalledWith({
    execFile: options.execFile,
    log: options.log,
    packageName: options.packageName,
    version: options.version,
    retries: options.npmRetries,
    retryMs: options.npmRetryMs,
    sleep: options.sleep,
  });
});

test("skips npm when it does not apply", async () => {
  await expect(verifyRegistryNpmCheck({ ...options, npm: false })).resolves.toEqual({ npm: false });
  expect(verifyNpmRegistry).not.toHaveBeenCalled();
});
