import pollExactHeadCi from "../../poll-exact-head.mjs";

export default function retryExactHeadCi(options, verifyLatestCi) {
  const {
    execFileSync,
    log,
    pending,
    repoArg,
    attempt,
    waitForCompletion,
    headSha,
    repository,
    runnerLabelsByJobName,
  } = options;
  return pollExactHeadCi({
    execFileSync,
    log,
    pending,
    repoArg,
    attempt,
    waitForCompletion,
    retry: (nextAttempt) =>
      verifyLatestCi(
        execFileSync,
        log,
        { headSha, repository, waitForCompletion: true, runnerLabelsByJobName },
        nextAttempt,
        null,
      ),
  });
}
