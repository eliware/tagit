import { jest } from "@jest/globals";
import resolveLatestReleaseTag from "../../../../src/commands/release-wait/resolve/latest-tag.mjs";

test("resolves the latest reachable semantic release tag and commit", () => {
  const exec = jest.fn((command, args) => {
    if (args[0] === "tag") return "v2.0.0-rc.1\nv1.10.0\nv1.9.0\n";
    if (args[0] === "rev-list") return "abc\n";
    return "tag-object\n";
  });
  expect(resolveLatestReleaseTag(exec)).toEqual({ version: "1.10.0", commitSha: "abc" });
  expect(exec).toHaveBeenNthCalledWith(1, "git", [
    "tag",
    "--merged",
    "HEAD",
    "--sort=-version:refname",
  ]);
  expect(exec).toHaveBeenNthCalledWith(2, "git", ["rev-parse", "refs/tags/v1.10.0"]);
  expect(exec).toHaveBeenNthCalledWith(3, "git", ["rev-list", "-n", "1", "tag-object"]);
  expect(exec).toHaveBeenNthCalledWith(4, "git", ["rev-parse", "refs/tags/v1.10.0"]);
});

test("rejects when no reachable semantic release tag exists", () => {
  expect(() => resolveLatestReleaseTag(jest.fn(() => "v-next\nv1.2.3-rc.1\n"))).toThrow(
    "not a semantic",
  );
});

test("reports when the repository has no tags", () => {
  expect(() => resolveLatestReleaseTag(jest.fn(() => ""))).toThrow("none");
});

test("rejects noncanonical leading-zero release tags", () => {
  expect(() => resolveLatestReleaseTag(jest.fn(() => "v01.2.3\n"))).toThrow("not a semantic");
});
