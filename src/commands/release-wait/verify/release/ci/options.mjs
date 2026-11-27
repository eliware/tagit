export default function buildReleaseCiPollOptions({
  execFile,
  repo,
  headSha,
  tag,
  pollMs,
  maxPolls,
  sleep,
  log,
}) {
  return { execFile, repo, headSha, tag, pollMs, maxPolls, sleep, log };
}
