/**
 * Release operates on the commit that passed preflight. It adds an empty commit and pushes
 * the release commit and tag to main in one atomic operation.
 */
import { releaseTag as releaseTagForVersion } from "../../policy/tag-policy.mjs";
import { runReleaseTagTransaction } from "./run-release-tag-transaction.mjs";
import { runGit } from "../commands/run-git.mjs";
import { createReleaseCommit } from "./create-release-commit.mjs";
import { pushReleaseRefs } from "./push-release-refs.mjs";
import { prepareReleaseTag } from "./prepare-release-tag.mjs";
import { verifyRemoteTag } from "../tags/verify-remote-tag.mjs";

export function gitOperations(execFileSync, _fs, log, newVersion, { dryRun = false } = {}) {
  const releaseTag = releaseTagForVersion(newVersion);
  if (dryRun) {
    log.info(`Dry run complete: ${newVersion} was not released`);
    return;
  }

  log.info("Starting git operations");
  return runReleaseTagTransaction({
    execFileSync,
    log,
    releaseTag,
    version: newVersion,
    createReleaseCommit,
    prepareReleaseTag,
    pushReleaseRefs,
    runGit,
    verifyRemoteTag,
  });
}
