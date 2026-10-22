import { jest } from "@jest/globals";

const verifyGhcrPublication = jest.fn(async () => ({ imageDigest: "sha256:release" }));
jest.unstable_mockModule("../../../../../src/registries/ghcr/verify/publication.mjs", () => ({
  verifyGhcrPublication,
}));

const { verifyGhcrRegistry } =
  await import("../../../../../src/commands/release-wait/verify/registries/ghcr.mjs");

beforeEach(() => jest.clearAllMocks());

test("passes expected image digest and polling options to GHCR verification", async () => {
  const log = { info: jest.fn() };
  const execFile = jest.fn();
  const sleep = jest.fn();
  await expect(
    verifyGhcrRegistry({
      execFile,
      log,
      repo: "eliware/demo",
      version: "1.0.0",
      release: { imageDigest: "sha256:expected" },
      retries: 3,
      retryMs: 10,
      sleep,
    }),
  ).resolves.toEqual({ imageDigest: "sha256:release" });
  expect(log.info).toHaveBeenCalledWith("Checking GHCR publication for eliware/demo:1.0.0.");
  expect(verifyGhcrPublication).toHaveBeenCalledWith(execFile, log, {
    repository: "eliware/demo",
    version: "1.0.0",
    expectedDigest: "sha256:expected",
    retries: 3,
    retryMs: 10,
    sleep,
  });
});

test("allows GHCR verification when release data has no expected digest", async () => {
  await verifyGhcrRegistry({
    execFile: jest.fn(),
    log: { info: jest.fn() },
    repo: "eliware/demo",
    version: "1.0.0",
    release: {},
    retries: 1,
    retryMs: 0,
    sleep: jest.fn(),
  });
  expect(verifyGhcrPublication).toHaveBeenCalledWith(
    expect.any(Function),
    expect.any(Object),
    expect.objectContaining({ expectedDigest: null }),
  );
});
