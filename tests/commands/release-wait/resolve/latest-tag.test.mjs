import { jest } from "@jest/globals";
import { resolveLatestReleaseTag } from "../../../../src/commands/release-wait/resolve/latest-tag.mjs";

test("resolves and confirms the latest semantic release tag", () => {
  const exec = jest.fn((command, args) => {
    if (args[0] === "describe") return "v1.2.3\n";
    if (args[0] === "rev-list") return "abc\n";
    return "tag-object\n";
  });
  expect(resolveLatestReleaseTag(exec)).toEqual({ version: "1.2.3", commitSha: "abc" });
});
test("resolves the exact tag selected by Git describe", () => {
  const exec = jest.fn((command, args) => {
    if (args[0] === "describe") return "1.2.3\n";
    if (args[0] === "rev-list") return "abc\n";
    return "tag-object\n";
  });
  expect(resolveLatestReleaseTag(exec)).toEqual({ version: "1.2.3", commitSha: "abc" });
  expect(exec).toHaveBeenNthCalledWith(2, "git", ["rev-parse", "refs/tags/1.2.3"]);
  expect(exec).toHaveBeenNthCalledWith(3, "git", ["rev-list", "-n", "1", "tag-object"]);
});

test("rejects invalid or changing latest tags", () => {
  expect(() => resolveLatestReleaseTag(jest.fn(() => "v-next"))).toThrow("not a semantic");
  let calls = 0;
  expect(() =>
    resolveLatestReleaseTag(
      jest.fn((command, args) => {
        if (args[0] === "describe") return "v1.2.3";
        if (args[0] === "rev-list") return "commit";
        return calls++ ? "second-tag-object" : "first-tag-object";
      }),
    ),
  ).toThrow("changed");
});

test("rejects noncanonical leading-zero release tags", () => {
  expect(() => resolveLatestReleaseTag(jest.fn(() => "v01.2.3"))).toThrow("not a semantic");
});
