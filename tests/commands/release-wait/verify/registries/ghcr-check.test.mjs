import { jest } from "@jest/globals";

const verifyGhcrRegistry = jest.fn();

jest.unstable_mockModule(
  "../../../../../src/commands/release-wait/verify/registries/ghcr.mjs",
  () => ({
    verifyGhcrRegistry,
  }),
);

const { verifyGhcrPublication } =
  await import("../../../../../src/commands/release-wait/verify/registries/ghcr-check.mjs");

beforeEach(() => jest.clearAllMocks());

test("returns not applicable when publication discovery returns false", async () => {
  await expect(verifyGhcrPublication({ fs: {}, applicable: false })).resolves.toEqual({
    ghcr: false,
  });
  expect(verifyGhcrRegistry).not.toHaveBeenCalled();
});

test("verifies an applicable GHCR publication and returns its digest", async () => {
  verifyGhcrRegistry.mockResolvedValue({ imageDigest: "sha256:release" });
  const options = {
    fs: {},
    applicable: true,
    execFile: jest.fn(),
    log: { info: jest.fn() },
    repo: "eliware/demo",
    version: "1.0.0",
    retries: 2,
    retryMs: 5,
    release: { imageDigest: "sha256:expected" },
    sleep: jest.fn(),
  };
  await expect(verifyGhcrPublication(options)).resolves.toEqual({
    ghcr: true,
    imageDigest: "sha256:release",
  });
  expect(verifyGhcrRegistry).toHaveBeenCalledWith({
    execFile: options.execFile,
    log: options.log,
    repo: options.repo,
    version: options.version,
    retries: options.retries,
    retryMs: options.retryMs,
    release: options.release,
    sleep: options.sleep,
  });
});
