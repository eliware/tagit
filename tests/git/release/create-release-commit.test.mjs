import { jest } from "@jest/globals";
import { createReleaseCommit } from "../../../src/git/release/create-release-commit.mjs";

test("creates a dated empty release commit", () => {
  const runGit = jest.fn((args) => (args[0] === "rev-parse" ? "abc123\n" : ""));
  expect(createReleaseCommit(runGit, "1.2.3", "v1.2.3", new Date("2026-10-15T12:00:00Z"))).toBe(
    "abc123",
  );
  expect(runGit).toHaveBeenCalledWith(
    ["commit", "--allow-empty", "-m", "Release v1.2.3 - 2026-10-15"],
    { stdio: "inherit" },
  );
});

test("returns the existing HEAD without creating another release commit", () => {
  const runGit = jest.fn((args) => {
    if (args[0] === "tag") return "v1.2.3\n";
    return "abc123\n";
  });
  expect(createReleaseCommit(runGit, "1.2.3", "v1.2.3")).toBe("abc123");
  expect(runGit).not.toHaveBeenCalledWith(expect.arrayContaining(["commit"]), expect.anything());
});

test.each(["", undefined])(
  "rejects invalid HEAD output %s before creating a commit or tag",
  (head) => {
    const runGit = jest.fn(() => head);
    expect(() => createReleaseCommit(runGit, "1.2.3", "v1.2.3")).toThrow("valid current commit");
    expect(runGit.mock.calls.some(([args]) => ["commit", "tag"].includes(args[0]))).toBe(false);
  },
);
