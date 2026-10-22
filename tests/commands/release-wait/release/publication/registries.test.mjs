import { jest } from "@jest/globals";

const verifyRegistries = jest.fn(async () => ({ npm: true, ghcr: false }));
jest.unstable_mockModule("../../../../../src/commands/release-wait/verify/registries.mjs", () => ({
  verifyRegistries,
}));
const { verifyPublicationRegistries } =
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
});
