import { validateCurrentHead } from "../tags/validate-release-tag.mjs";
import { resolveExistingTag } from "../tags/resolve-existing-tag.mjs";
import { createTag } from "../tags/create-tag.mjs";

export function prepareReleaseTag(execFileSync, log, releaseTag) {
  const runFile = (executable, args, options) => execFileSync(executable, args, options);
  const { currentHead } = validateCurrentHead(
    runFile("git", ["rev-parse", "HEAD"], { encoding: "utf8" }),
    null,
  );
  const existing = resolveExistingTag(runFile, releaseTag, currentHead);
  if (existing.reuse) log.info(`Tag ${releaseTag} points to the current commit. Use the tag.`);
  else {
    if (existing.existingTagHead)
      throw new Error(
        `Release tag ${releaseTag} points to ${existing.existingTagHead}, not the current commit ${currentHead}.`,
      );
    log.info(`Add tag ${releaseTag} to the current commit.`);
    createTag((args, options) => runFile("git", args, options), releaseTag, currentHead);
  }
  return { currentHead };
}
