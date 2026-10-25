import { jest } from "@jest/globals";
import { readUpstreamMergeConflictFiles } from "../../../../src/upstream/merge/conflict/files.mjs";

test("reads unmerged Git file names", () => {
  const execFileSync = jest.fn(() => "src/file.mjs\n");
  expect(readUpstreamMergeConflictFiles(execFileSync)).toBe("src/file.mjs\n");
  expect(execFileSync).toHaveBeenCalledWith("git", ["diff", "--name-only", "--diff-filter=U"], {
    encoding: "utf8",
  });
});

test("propagates errors when Git cannot read unmerged file names", () => {
  expect(() =>
    readUpstreamMergeConflictFiles(
      jest.fn(() => {
        throw new Error("git diff failed");
      }),
    ),
  ).toThrow("git diff failed");
});
