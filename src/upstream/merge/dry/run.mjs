export function reportUpstreamDryRun(log, upstreamBranch, message) {
  log.log(
    `Dry run: can fetch upstream, merge ${upstreamBranch} with message "${message}", then push.`,
  );
}
