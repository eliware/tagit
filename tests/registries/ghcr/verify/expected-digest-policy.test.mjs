import { requireExpectedDigest } from "../../../../src/registries/ghcr/verify/expected-digest-policy.mjs";

const digest = `sha256:${"a".repeat(64)}`;

test("accepts a matching or unspecified expected digest", () => {
  expect(() => requireExpectedDigest(digest, digest, "eliware/demo", "1.0.0")).not.toThrow();
  expect(() => requireExpectedDigest(digest, null, "eliware/demo", "1.0.0")).not.toThrow();
});

test("rejects a digest that differs from the expected value", () => {
  expect(() =>
    requireExpectedDigest(digest, `sha256:${"b".repeat(64)}`, "eliware/demo", "1.0.0"),
  ).toThrow("digest mismatch");
});
