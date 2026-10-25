export function buildReleaseCiPollOptions({
  execFile,
  repo,
  headSha,
  tag,
  pollMs,
  maxPolls,
  sleep,
  linksOnly,
  log,
}) {
  return { execFile, repo, headSha, tag, pollMs, maxPolls, sleep, linksOnly, log };
}
