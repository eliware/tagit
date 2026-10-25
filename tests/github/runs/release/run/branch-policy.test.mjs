import { selectReleaseRunBranches } from "../../../../../src/github/runs/release/run/branch-policy.mjs";

test("uses the CI branch policy by default", () => {
  expect(selectReleaseRunBranches("v1.0.0")).toEqual(["main", "v1.0.0", "refs/tags/v1.0.0"]);
});

test("allows main and tagged refs for CI workflows", () => {
  expect(selectReleaseRunBranches("v1.0.0", ".github/workflows/ci.yaml")).toEqual([
    "main",
    "v1.0.0",
    "refs/tags/v1.0.0",
  ]);
});

test.each([".github/workflows/npm.yaml", ".github/workflows/ghcr.yaml"])(
  "allows only tagged refs for publication workflow %s",
  (workflowPath) => {
    expect(selectReleaseRunBranches("v1.0.0", workflowPath)).toEqual([
      "v1.0.0",
      "refs/tags/v1.0.0",
    ]);
  },
);
