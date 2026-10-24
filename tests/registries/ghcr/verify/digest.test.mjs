import { imageDigest } from "../../../../src/registries/ghcr/verify/digest.mjs";

test("reads and validates image digests", () => {
  const digest = `sha256:${"a".repeat(64)}`;
  expect(imageDigest({ name: digest })).toBe(digest);
  expect(imageDigest({})).toBeNull();
});
