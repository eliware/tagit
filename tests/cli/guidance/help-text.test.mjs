import { helpText } from "../../../src/cli/guidance/help-text.mjs";
test("documents the owner and DevOps command boundary", () => {
  expect(helpText()).toContain("Project owners can run notes, push, and preflight.");
  expect(helpText()).toContain("DevOps can run release and release-wait after preflight passes.");
});

test("documents dry-run behavior for push and release", () => {
  expect(helpText()).toContain("For push, skip push and CI lookup.");
  expect(helpText()).toContain("For release, check version data only.");
  expect(helpText()).toContain("Skip preflight, commit, tag, push, and publication.");
});
