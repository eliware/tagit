import { jest } from "@jest/globals";

const publishesGhcr = jest.fn();
const verifyGhcrRegistry = jest.fn();

jest.unstable_mockModule("../../../../src/registries/ghcr/discover-publication.mjs", () => ({
  publishesGhcr,
}));
jest.unstable_mockModule(
  "../../../../src/commands/release-wait/verify/registries/ghcr.mjs",
  () => ({ verifyGhcrRegistry }),
);

const { verifyGhcrRegistryIfApplicable } =
  await import("../../../../src/commands/release-wait/verify/ghcr-registry.mjs");

beforeEach(() => jest.clearAllMocks());

test("returns not applicable when the repository has no GHCR publication", async () => {
  publishesGhcr.mockReturnValue(false);
  await expect(verifyGhcrRegistryIfApplicable({}, {})).resolves.toEqual({ ghcr: false });
  expect(verifyGhcrRegistry).not.toHaveBeenCalled();
});

test("uses a known profile decision without rereading package metadata", async () => {
  await expect(verifyGhcrRegistryIfApplicable({}, {}, false)).resolves.toEqual({ ghcr: false });
  expect(publishesGhcr).not.toHaveBeenCalled();
  expect(verifyGhcrRegistry).not.toHaveBeenCalled();
});

test("verifies a declared GHCR publication and returns its digest", async () => {
  publishesGhcr.mockReturnValue(true);
  verifyGhcrRegistry.mockResolvedValue({ imageDigest: "sha256:release" });
  const options = { version: "1.0.0" };
  await expect(verifyGhcrRegistryIfApplicable({}, options)).resolves.toEqual({
    ghcr: true,
    imageDigest: "sha256:release",
  });
  expect(verifyGhcrRegistry).toHaveBeenCalledWith(options);
});
