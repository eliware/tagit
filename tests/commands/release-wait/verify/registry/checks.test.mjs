import { jest } from "@jest/globals";

const verifyNpmRegistry = jest.fn();
const verifyGhcrPublication = jest.fn();

jest.unstable_mockModule(
  "../../../../../src/commands/release-wait/verify/registries/npm-check.mjs",
  () => ({ default: verifyNpmRegistry }),
);
jest.unstable_mockModule(
  "../../../../../src/commands/release-wait/verify/registries/ghcr-check.mjs",
  () => ({ default: verifyGhcrPublication }),
);

const { default: verifyRegistryChecks } =
  await import("../../../../../src/commands/release-wait/verify/registry/checks.mjs");

const options = {
  fs: {},
  execFile: jest.fn(),
  log: { info: jest.fn() },
  repo: "eliware/demo",
  version: "1.0.0",
  release: { imageDigest: "sha256:expected" },
  packageName: "demo",
  npm: false,
  ghcr: false,
  maxPolls: 2,
  npmRetries: 3,
  pollMs: 5,
  npmRetryMs: 10,
  sleep: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  verifyGhcrPublication.mockResolvedValue({ ghcr: false });
});

test("runs GHCR without npm when only GHCR applies", async () => {
  verifyGhcrPublication.mockResolvedValue({ ghcr: true, imageDigest: "sha256:release" });
  await expect(verifyRegistryChecks({ ...options, npm: false, ghcr: true })).resolves.toEqual({
    npm: false,
    ghcr: true,
    imageDigest: "sha256:release",
  });
  expect(verifyNpmRegistry).not.toHaveBeenCalled();
  expect(verifyGhcrPublication).toHaveBeenCalledWith(
    expect.objectContaining({ applicable: true, repo: options.repo, retryMs: options.pollMs }),
  );
});

test("runs applicable npm and GHCR checks and combines their results", async () => {
  verifyGhcrPublication.mockResolvedValue({ ghcr: true, imageDigest: "sha256:release" });
  await expect(verifyRegistryChecks({ ...options, npm: true, ghcr: true })).resolves.toEqual({
    npm: true,
    ghcr: true,
    imageDigest: "sha256:release",
  });
  expect(verifyNpmRegistry).toHaveBeenCalledWith({
    execFile: options.execFile,
    log: options.log,
    packageName: options.packageName,
    version: options.version,
    retries: options.npmRetries,
    retryMs: options.npmRetryMs,
    sleep: options.sleep,
  });
  expect(verifyGhcrPublication).toHaveBeenCalledWith(
    expect.objectContaining({ applicable: true, repo: options.repo, retryMs: options.pollMs }),
  );
});
