import readRepositoryName from "../../../repository/repository-name/read-repository-name.mjs";
import reportCiRunLinks from "./run-links.mjs";
import waitSyncDefault from "../../../process/timing/wait-sync.mjs";
import readCiRunsWithRetry from "./retry-policy.mjs";

export default function reportCiLinks(
  execFileSync,
  log,
  headSha,
  { attempts = 1, delayMs = 0, waitSync = waitSyncDefault } = {},
) {
  const repo = readRepositoryName(execFileSync);
  const runs = readCiRunsWithRetry(execFileSync, log, repo, headSha, {
    attempts,
    delayMs,
    waitSync,
  });
  if (!runs.length) {
    return { repo, headSha, runs };
  }
  reportCiRunLinks(execFileSync, log, repo, runs);
  return { repo, headSha, runs };
}
