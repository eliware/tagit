import { readRepositoryName } from './read-repository-name.mjs';
import { readCiRuns } from './read-ci-run-links.mjs';
import { reportCiRunLinks } from './report-ci-run-links.mjs';
import { waitSync as waitSyncDefault } from '../../process/timing/wait-sync.mjs';

export function reportCiLinks(
  execFileSync,
  log,
  headSha,
  { attempts = 1, delayMs = 0, waitSync = waitSyncDefault } = {},
) {
  const repo = readRepositoryName(execFileSync);
  let runs = [];
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    runs = readCiRuns(execFileSync, repo, headSha);
    if (runs.length || attempt + 1 >= attempts) break;
    waitSync(delayMs);
  }
  if (!runs.length) {
    log.info(`No CI run exists yet for ${headSha}.`);
    return { repo, headSha, runs };
  }
  reportCiRunLinks(execFileSync, log, repo, runs);
  return { repo, headSha, runs };
}
