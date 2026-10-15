import { validateCurrentHead } from "../tags/validate-release-tag.mjs";

export function createReleaseCommit(runGit, version, tag, date = new Date()) {
  const { currentHead: head } = validateCurrentHead(
    runGit(["rev-parse", "HEAD"], { encoding: "utf8" }),
    null,
  );
  const existing = String(runGit(["tag", "--list", tag], { encoding: "utf8" })).trim();
  if (existing) {
    const { existingTagHead: taggedHead } = validateCurrentHead(
      head,
      runGit(["rev-parse", tag], { encoding: "utf8" }),
    );
    if (taggedHead !== head)
      throw new Error(`Release tag ${tag} already points to ${taggedHead}, not HEAD ${head}.`);
    return head;
  }
  const releaseDate = date.toISOString().slice(0, 10);
  runGit(["commit", "--allow-empty", "-m", `Release v${version} - ${releaseDate}`], {
    stdio: "inherit",
  });
  return validateCurrentHead(runGit(["rev-parse", "HEAD"], { encoding: "utf8" }), null).currentHead;
}
