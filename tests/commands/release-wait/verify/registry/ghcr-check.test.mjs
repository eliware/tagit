import { jest } from "@jest/globals";

const verifyGhcrPublication = jest.fn();
jest.unstable_mockModule(
  "../../../../../src/commands/release-wait/verify/registries/ghcr-check.mjs",
  () => ({ verifyGhcrPublication }),
);
const { verifyRegistryGhcrCheck } =
  await import("../../../../../src/commands/release-wait/verify/registry/ghcr-check.mjs");

test("maps release registry options to the GHCR publication check", () => {
  const options = {
    fs: {},
    execFile: jest.fn(),
    log: { info: jest.fn() },
    repo: "eliware/demo",
    version: "1.0.0",
    release: { imageDigest: "sha256:expected" },
    ghcr: true,
    retries: 2,
    retryMs: 5,
    sleep: jest.fn(),
  };
  verifyRegistryGhcrCheck(options);
  expect(verifyGhcrPublication).toHaveBeenCalledWith({
    fs: options.fs,
    applicable: true,
    execFile: options.execFile,
    log: options.log,
    repo: options.repo,
    version: options.version,
    retries: 2,
    retryMs: 5,
    release: options.release,
    sleep: options.sleep,
  });
});
