import { hasGhcrPublicationProfile } from "../../../../src/registries/ghcr/publication/policy.mjs";

test("accepts the declared GHCR publication profile", () => {
  expect(hasGhcrPublicationProfile({ eliware: { apply: ["ghcr-published"] } })).toBe(true);
});

test.each([null, {}, { eliware: {} }, { eliware: { apply: "ghcr-published" } }])(
  "rejects package metadata without a GHCR profile",
  (packageData) => {
    expect(hasGhcrPublicationProfile(packageData)).toBe(false);
  },
);
