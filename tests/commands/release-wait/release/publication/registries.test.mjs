import { jest } from "@jest/globals";

const verifyRegistries = jest.fn(async () => ({ npm: true, ghcr: false }));
const createRegistryResult = jest.fn((options, registries) => ({
  ...options,
  ci: true,
  ...registries,
}));
jest.unstable_mockModule("../../../../../src/commands/release-wait/verify/registries.mjs", () => ({
  default: verifyRegistries,
}));
jest.unstable_mockModule(
  "../../../../../src/commands/release-wait/verify/registry/result.mjs",
  () => ({ default: createRegistryResult }),
);
const { default: verifyPublicationRegistries } =
  await import("../../../../../src/commands/release-wait/release/publication/registries.mjs");

beforeEach(() => jest.clearAllMocks());

test("verifies registries and adds the release result fields", async () => {
  const options = { repo: "eliware/demo", tag: "v1.0.0", headSha: "abc" };
  await expect(verifyPublicationRegistries(options)).resolves.toEqual({
    ...options,
    ci: true,
    npm: true,
    ghcr: false,
  });
  expect(verifyRegistries).toHaveBeenCalledWith(options);
  expect(createRegistryResult).toHaveBeenCalledWith(options, { npm: true, ghcr: false });
});
