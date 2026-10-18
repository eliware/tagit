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
  verifyRemoteTag,
}) {
  let remoteSideEffects = false;
  try {
    const git = (args, options) => runGit(execFileSync, args, options);
    createReleaseCommit(git, version, releaseTag);
    const { currentHead } = prepareReleaseTag(execFileSync, log, releaseTag);
    log.info("Pushing the release commit and tag to the remote");
    remoteSideEffects = true;
    pushReleaseRefs((args, options) => git(args, options), releaseTag);
    const remoteTag = String(
      git(
        ["ls-remote", "--tags", "origin", `refs/tags/${releaseTag}`, `refs/tags/${releaseTag}^{}`],
        {
          encoding: "utf8",
        },
      ) ?? "",
    ).trim();
    verifyRemoteTag(remoteTag, releaseTag, currentHead);
    log.info("Git operations complete");
    return { commitSha: currentHead, tag: releaseTag };
  } catch (error) {
    throw reportReleaseFailure(log, error, remoteSideEffects);
  }
}
