import { validateCurrentHead } from "../tags/validate-release-tag.mjs";
import { reuseExistingReleaseTag } from "./reuse-existing-tag.mjs";

export function createReleaseCommit(runGit, version, tag, date = new Date()) {
  const { currentHead: head } = validateCurrentHead(
    runGit(["rev-parse", "HEAD"], { encoding: "utf8" }),
    null,
  );
  const releaseTag = reuseExistingReleaseTag(runGit, head, tag);
  if (releaseTag.tagReused) return releaseTag;
  const releaseDate = date.toISOString().slice(0, 10);
  runGit(["commit", "--allow-empty", "-m", `Release v${version} - ${releaseDate}`], {
    stdio: "inherit",
  });
  return {
    currentHead: validateCurrentHead(runGit(["rev-parse", "HEAD"], { encoding: "utf8" }), null)
      .currentHead,
    tagReused: false,
  };
}
