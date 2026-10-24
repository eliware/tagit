import { jest } from "@jest/globals";
import { isUpstreamMergeConflict } from "../../../../src/upstream/merge/conflict/policy.mjs";

test("detects a merge conflict when Git reports unmerged files", () => {
  const execFileSync = jest.fn(() => "src/file.mjs\n");
  expect(isUpstreamMergeConflict(execFileSync)).toBe(true);
  expect(execFileSync).toHaveBeenCalledWith("git", ["diff", "--name-only", "--diff-filter=U"], {
    encoding: "utf8",
  });
});

test("does not classify an empty unmerged-file list as a conflict", () => {
  expect(isUpstreamMergeConflict(jest.fn(() => " \n"))).toBe(false);
});

test("does not classify a failed conflict check as a conflict", () => {
  expect(
    isUpstreamMergeConflict(
      jest.fn(() => {
        throw new Error("git diff failed");
      }),
    ),
  ).toBe(false);
});
