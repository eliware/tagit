import { createTag } from "../tags/create-tag.mjs";

export function prepareReleaseTag(execFileSync, log, releaseTag, releaseState) {
  const runFile = (executable, args, options) => execFileSync(executable, args, options);
  const { currentHead, tagReused } = releaseState;
  if (tagReused) log.info(`Tag ${releaseTag} points to the current commit. Use the tag.`);
  else {
    log.info(`Add tag ${releaseTag} to the current commit.`);
    createTag((args, options) => runFile("git", args, options), releaseTag, currentHead);
  }
  return { currentHead };
}
