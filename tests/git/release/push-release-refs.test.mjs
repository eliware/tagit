import { jest } from "@jest/globals";
import { pushReleaseRefs } from "../../../src/git/release/push-release-refs.mjs";

test("pushes main and the release tag in one atomic operation", () => {
  const runGit = jest.fn();
  pushReleaseRefs(runGit, "v1.2.3");
  expect(runGit).toHaveBeenCalledWith(
    ["push", "--atomic", "origin", "HEAD:refs/heads/main", "refs/tags/v1.2.3"],
    { stdio: "inherit" },
  );
});
