import { jest } from "@jest/globals";

const verifyNpmRegistry = jest.fn(async () => {});
const verifyGhcrPublication = jest.fn(async () => ({ ghcr: false }));
const selectRegistryPolicy = jest.fn(() => ({ npm: false, ghcr: false }));

jest.unstable_mockModule("../../../../src/commands/release-wait/verify/registries/npm.mjs", () => ({
  verifyNpmRegistry,
}));
jest.unstable_mockModule(
  "../../../../src/commands/release-wait/verify/registries/ghcr-adapter.mjs",
  () => ({
    verifyGhcrPublication,
  }),
);
jest.unstable_mockModule(
  "../../../../src/commands/release-wait/verify/registry-policy.mjs",
  () => ({
    selectRegistryPolicy,
  }),
);
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
  verifyGhcrPublication.mockResolvedValue({ ghcr: false });
  selectRegistryPolicy.mockReturnValue({ npm: false, ghcr: false });
});

test("skips npm verification when the npm profile does not apply", async () => {
  await expect(
    verify({ applicable: false, packageName: "@eliware/demo", isPrivate: false }),
  ).resolves.toEqual({ npm: false, ghcr: false });
  expect(selectRegistryPolicy).toHaveBeenCalledTimes(1);
  expect(verifyNpmRegistry).not.toHaveBeenCalled();
  expect(verifyGhcrPublication).toHaveBeenCalledWith(
    expect.objectContaining({ applicable: false }),
  );
});

test("combines npm and GHCR verification results", async () => {
  selectRegistryPolicy.mockReturnValue({ npm: true, ghcr: true });
  verifyGhcrPublication.mockResolvedValue({ ghcr: true, imageDigest: "sha256:release" });
  await expect(verify({ packageName: "@eliware/demo", isPrivate: false })).resolves.toEqual({
    npm: true,
    ghcr: true,
    imageDigest: "sha256:release",
  });
  expect(verifyNpmRegistry).toHaveBeenCalledTimes(1);
  expect(verifyGhcrPublication).toHaveBeenCalledTimes(1);
  expect(verifyGhcrPublication).toHaveBeenCalledWith(
    expect.objectContaining({ applicable: true, retries: 2, retryMs: 5 }),
  );
});
