import { validateCurrentHead } from "../tags/validate-release-tag.mjs";

export function reuseExistingReleaseTag(runGit, head, tag) {
  const existing = String(runGit(["tag", "--list", tag], { encoding: "utf8" })).trim();
  if (!existing) return null;
  const { currentHead, existingTagHead } = validateCurrentHead(
    head,
    runGit(["rev-parse", tag], { encoding: "utf8" }),
  );
  if (existingTagHead !== currentHead)
    throw new Error(
      `Release tag ${tag} points to ${existingTagHead}, not the current commit ${currentHead}.`,
    );
  return currentHead;
}
