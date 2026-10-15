import { releaseGuide } from "../../../src/cli/guidance/release-guide.mjs";
test("documents the empty release commit and atomic push", () => {
  expect(releaseGuide()).toContain("creates an empty release commit");
  expect(releaseGuide()).toContain("pushes both refs atomically");
});
