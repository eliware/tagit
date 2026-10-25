import { requireExpectedDigest } from "../../../../src/registries/ghcr/verify/expected-digest-policy.mjs";

const digest = `sha256:${"a".repeat(64)}`;

test("accepts a valid digest when it matches or has no expected value", () => {
  expect(() => requireExpectedDigest(digest, digest, "eliware/demo", "1.0.0")).not.toThrow();
  expect(() => requireExpectedDigest(digest, null, "eliware/demo", "1.0.0")).not.toThrow();
});

test("rejects a missing digest", () => {
  expect(() => requireExpectedDigest(null, null, "eliware/demo", "1.0.0")).toThrow(
    "no valid SHA-256 digest",
  );
});

test("rejects a digest that differs from the expected value", () => {
  expect(() =>
    requireExpectedDigest(digest, `sha256:${"b".repeat(64)}`, "eliware/demo", "1.0.0"),
  ).toThrow("digest mismatch");
});
