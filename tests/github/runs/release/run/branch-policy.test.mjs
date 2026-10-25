import { selectReleaseRunBranches } from "../../../../../src/github/runs/release/run/branch-policy.mjs";

test("uses only tagged refs for release workflows", () => {
  expect(selectReleaseRunBranches("v1.0.0")).toEqual(["v1.0.0", "refs/tags/v1.0.0"]);
});
