import { jest } from "@jest/globals";

const selectRegistryPolicy = jest.fn();
const verifyRegistryChecks = jest.fn();

jest.unstable_mockModule(
  "../../../../src/commands/release-wait/verify/registry/policy.mjs",
  () => ({ default: selectRegistryPolicy }),
);
jest.unstable_mockModule(
  "../../../../src/commands/release-wait/verify/registry/checks.mjs",
  () => ({ default: verifyRegistryChecks }),
);

const { default: verifyRegistries } =
  await import("../../../../src/commands/release-wait/verify/registries.mjs");

const options = {
  fs: {},
  execFile: jest.fn(),
  log: { info: jest.fn() },
  repo: "eliware/demo",
  version: "1.0.0",
  release: { imageDigest: "sha256:expected" },
  applicable: true,
  packageName: "demo",
  isPrivate: false,
  ghcrApplicable: true,
  maxPolls: 2,
  npmRetries: 3,
  pollMs: 5,
  npmRetryMs: 10,
  sleep: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  selectRegistryPolicy.mockImplementation((value) => ({ ...value, npm: false, ghcr: false }));
  verifyRegistryChecks.mockResolvedValue({ npm: false, ghcr: false });
});

test("coordinates policy selection and registry checks", async () => {
  await expect(verifyRegistries(options)).resolves.toEqual({ npm: false, ghcr: false });
  expect(selectRegistryPolicy).toHaveBeenCalledWith(options);
  expect(verifyRegistryChecks).toHaveBeenCalledWith({ ...options, npm: false, ghcr: false });
});

test("returns the combined registry result from the check coordinator", async () => {
  selectRegistryPolicy.mockImplementation((value) => ({ ...value, npm: true, ghcr: true }));
  verifyRegistryChecks.mockResolvedValue({ npm: true, ghcr: true, imageDigest: "sha256:release" });
  await expect(verifyRegistries(options)).resolves.toEqual({
    npm: true,
    ghcr: true,
    imageDigest: "sha256:release",
  });
  expect(verifyRegistryChecks).toHaveBeenCalledWith(
    expect.objectContaining({ ...options, npm: true, ghcr: true }),
  );
});
