import { jest } from "@jest/globals";
import { isUpstreamMergeConflict } from "../../../../src/upstream/merge/conflict/policy.mjs";

test.each([
  ["file names", "src/file.mjs\n", true],
  ["an empty file list", " \n", false],
  ["a missing file list", null, false],
])("classifies %s as a conflict: %s", (_name, files, expected) => {
  expect(isUpstreamMergeConflict(jest.fn(() => files))).toBe(expected);
});
