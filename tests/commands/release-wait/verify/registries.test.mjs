import { jest } from "@jest/globals";

const verifyNpmRegistry = jest.fn(async () => {});
const verifyGhcrRegistryIfApplicable = jest.fn(async () => ({ ghcr: false }));

jest.unstable_mockModule("../../../../src/commands/release-wait/verify/registries/npm.mjs", () => ({
  verifyNpmRegistry,
}));
jest.unstable_mockModule("../../../../src/commands/release-wait/verify/ghcr-registry.mjs", () => ({
  verifyGhcrRegistryIfApplicable,
}));

const { verifyRegistries } =
  await import("../../../../src/commands/release-wait/verify/registries.mjs");

const verify = (overrides = {}) =>
  verifyRegistries({
    fs: {},
    execFile: jest.fn(),
    log: { info: jest.fn() },
    repo: "eliware/demo",
    version: "1.0.0",
    release: { imageDigest: "sha256:expected" },
    applicable: true,
    packageName: null,
    isPrivate: true,
    maxPolls: 2,
    npmRetries: 2,
    pollMs: 5,
    npmRetryMs: 10,
    sleep: jest.fn(),
    ...overrides,
  });

beforeEach(() => {
  jest.clearAllMocks();
  verifyGhcrRegistryIfApplicable.mockResolvedValue({ ghcr: false });
});

test("skips npm verification when the npm profile does not apply", async () => {
  await expect(
    verify({ applicable: false, packageName: "@eliware/demo", isPrivate: false }),
  ).resolves.toEqual({ npm: false, ghcr: false });
  expect(verifyNpmRegistry).not.toHaveBeenCalled();
  expect(verifyGhcrRegistryIfApplicable).toHaveBeenCalledTimes(1);
});

test("selects npm verification for a public package", async () => {
  await expect(verify({ packageName: "@eliware/demo", isPrivate: false })).resolves.toEqual({
    npm: true,
    ghcr: false,
  });
  expect(verifyNpmRegistry).toHaveBeenCalledTimes(1);
  expect(verifyGhcrRegistryIfApplicable).toHaveBeenCalledTimes(1);
});

test("combines npm and GHCR verification results", async () => {
  verifyGhcrRegistryIfApplicable.mockResolvedValue({ ghcr: true, imageDigest: "sha256:release" });
  await expect(verify({ packageName: "@eliware/demo", isPrivate: false })).resolves.toEqual({
    npm: true,
    ghcr: true,
    imageDigest: "sha256:release",
  });
  expect(verifyNpmRegistry).toHaveBeenCalledTimes(1);
  expect(verifyGhcrRegistryIfApplicable).toHaveBeenCalledTimes(1);
});
