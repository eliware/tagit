import { reportReleaseFailure } from "./report-release-failure.mjs";

export function runReleaseTagTransaction({
  execFileSync,
  log,
  releaseTag,
  version,
  createReleaseCommit,
  prepareReleaseTag,
  pushReleaseRefs,
  runGit,
  verifyPushedTag,
}) {
  let remoteSideEffects = false;
  try {
    const git = (args, options) => runGit(execFileSync, args, options);
    const releaseState = createReleaseCommit(git, version, releaseTag);
    const { currentHead } = prepareReleaseTag(execFileSync, log, releaseTag, releaseState);
    log.info("Pushing the release commit and tag to the remote");
    remoteSideEffects = true;
    pushReleaseRefs((args, options) => git(args, options), releaseTag);
    verifyPushedTag(git, releaseTag, currentHead);
    log.info("Git operations complete");
    return { commitSha: currentHead, tag: releaseTag };
  } catch (error) {
    throw reportReleaseFailure(log, error, remoteSideEffects);
  }
}
