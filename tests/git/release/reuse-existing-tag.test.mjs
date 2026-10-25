import { jest } from "@jest/globals";
import { reuseExistingReleaseTag } from "../../../src/git/release/reuse-existing-tag.mjs";

test("returns null when the release tag does not exist", () => {
  const runGit = jest.fn(() => "");
  expect(reuseExistingReleaseTag(runGit, "abc123", "v1.2.3")).toEqual({
    currentHead: "abc123",
    tagReused: false,
  });
  expect(runGit).toHaveBeenCalledTimes(1);
});

test("reuses an existing release tag that points to HEAD", () => {
  const runGit = jest.fn((args) => (args[0] === "tag" ? "v1.2.3\n" : "abc123\n"));
  expect(reuseExistingReleaseTag(runGit, "abc123", "v1.2.3")).toEqual({
    currentHead: "abc123",
    tagReused: true,
  });
  expect(runGit).toHaveBeenCalledWith(["rev-parse", "v1.2.3"], { encoding: "utf8" });
});

test("rejects an existing tag that points away from HEAD", () => {
  const runGit = jest.fn((args) => (args[0] === "tag" ? "v1.2.3\n" : "def456\n"));
  expect(() => reuseExistingReleaseTag(runGit, "abc123", "v1.2.3")).toThrow("points to def456");
});

test("rejects invalid existing tag output", () => {
  const runGit = jest.fn((args) => (args[0] === "tag" ? "v1.2.3\n" : "invalid"));
  expect(() => reuseExistingReleaseTag(runGit, "abc123", "v1.2.3")).toThrow(
    "Cannot verify existing release tag",
  );
});
