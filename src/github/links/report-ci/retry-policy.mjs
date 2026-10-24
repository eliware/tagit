import { readCiRuns } from "../read/ci-run-links.mjs";

export function readCiRunsWithRetry(
  execFileSync,
  log,
  repo,
  headSha,
  { attempts, delayMs, waitSync },
) {
  let runs = [];
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    runs = readCiRuns(execFileSync, repo, headSha);
    if (runs.length || attempt + 1 >= attempts) break;
    waitSync(delayMs);
  }
  if (!runs.length) log.info(`No CI run exists for ${headSha} at this time.`);
  return runs;
}
