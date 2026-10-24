import { jest } from "@jest/globals";
import { verifyPushedTag } from "../../../src/git/release/verify-pushed-tag.mjs";

test("reads and verifies the remote release tag", () => {
  const git = jest.fn(() => "tag-object\trefs/tags/v1.0.0\nabc\trefs/tags/v1.0.0^{}\n");
  expect(verifyPushedTag(git, "v1.0.0", "abc")).toBe("abc");
  expect(git).toHaveBeenCalledWith(
    ["ls-remote", "--tags", "origin", "refs/tags/v1.0.0", "refs/tags/v1.0.0^{}"],
    { encoding: "utf8" },
  );
});

test("rejects a missing remote release tag", () => {
  expect(() =>
    verifyPushedTag(
      jest.fn(() => undefined),
      "v1.0.0",
      "abc",
    ),
  ).toThrow("does not resolve");
});
