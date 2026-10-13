import { jest } from "@jest/globals";

const verifyNpmPublication = jest.fn(async () => {});
const verifyGhcrPublication = jest.fn(async () => ({ imageDigest: "sha256:release" }));
const publishesGhcr = jest.fn(() => false);

jest.unstable_mockModule("../../../src/registries/npm/verify-publication.mjs", () => ({
  verifyNpmPublication,
}));
jest.unstable_mockModule("../../../src/registries/ghcr/verify-publication.mjs", () => ({
  verifyGhcrPublication,
}));
jest.unstable_mockModule("../../../src/registries/ghcr/discover-publication.mjs", () => ({
  publishesGhcr,
}));

const { verifyRegistries } =
  await import("../../../src/commands/release-wait/verify-registries.mjs");

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
  publishesGhcr.mockReturnValue(false);
});

test("skips npm verification when the npm profile does not apply", async () => {
  await expect(
    verify({ applicable: false, packageName: "@eliware/demo", isPrivate: false }),
  ).resolves.toEqual({ npm: false, ghcr: false });
  expect(verifyNpmPublication).not.toHaveBeenCalled();
});

test("skips both registries when neither publication applies", async () => {
  await expect(verify()).resolves.toEqual({ npm: false, ghcr: false });
  expect(verifyNpmPublication).not.toHaveBeenCalled();
  expect(verifyGhcrPublication).not.toHaveBeenCalled();
});

test("runs npm verification for a public npm package only", async () => {
  await expect(verify({ packageName: "@eliware/demo", isPrivate: false })).resolves.toEqual({
    npm: true,
    ghcr: false,
  });
  expect(verifyNpmPublication).toHaveBeenCalledWith(expect.any(Function), expect.any(Object), {
    packageName: "@eliware/demo",
    version: "1.0.0",
    retries: 2,
    retryMs: 10,
    sleep: expect.any(Function),
  });
  expect(verifyGhcrPublication).not.toHaveBeenCalled();
});

test("runs GHCR verification for a published image only", async () => {
  publishesGhcr.mockReturnValue(true);
  await expect(verify()).resolves.toEqual({
    npm: false,
    ghcr: true,
    imageDigest: "sha256:release",
  });
  expect(verifyNpmPublication).not.toHaveBeenCalled();
  expect(verifyGhcrPublication).toHaveBeenCalledWith(expect.any(Function), expect.any(Object), {
    repository: "eliware/demo",
    version: "1.0.0",
    expectedDigest: "sha256:expected",
    retries: 2,
    retryMs: 5,
    sleep: expect.any(Function),
  });
});

test("passes a null expected digest when release metadata has no image digest", async () => {
  publishesGhcr.mockReturnValue(true);
  await verify({ release: {} });
  expect(verifyGhcrPublication).toHaveBeenCalledWith(
    expect.any(Function),
    expect.any(Object),
    expect.objectContaining({ expectedDigest: null }),
  );
});
