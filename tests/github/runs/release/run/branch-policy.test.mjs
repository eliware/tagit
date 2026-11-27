import selectReleaseRunBranches from "../../../../../src/github/runs/release/run/branch-policy.mjs";

test("allows main and tagged refs for release runs", () => {
  expect(selectReleaseRunBranches("v1.0.0")).toEqual(["main", "v1.0.0", "refs/tags/v1.0.0"]);
});
