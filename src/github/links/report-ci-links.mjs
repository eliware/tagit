import { waitSync } from '../../process/timing/wait-sync.mjs';
import { readRepositoryName } from './read-repository-name.mjs';
import { readCiRuns } from './read-ci-run-links.mjs';
import { reportCiRunLinks } from './report-ci-run-links.mjs';

export function reportCiLinks(execFileSync, log, headSha, { attempts = 1, delayMs = 2000 } = {}) {
  if (!Number.isInteger(attempts) || attempts < 1) throw new Error('CI link attempts must be a positive integer.');
  if (!Number.isFinite(delayMs) || delayMs < 0) throw new Error('CI link delay must be non-negative.');
  const repo = readRepositoryName(execFileSync);
  let runs = [];
  for (let attempt = 0; attempt < attempts && !runs.length; attempt += 1) {
    runs = readCiRuns(execFileSync, repo, headSha);
    if (!runs.length && attempt + 1 < attempts) waitSync(delayMs);
  }
  if (!runs.length) {
    log.info(`No CI run exists yet for ${headSha}.`);
    return { repo, headSha, runs: [] };
  }
  reportCiRunLinks(execFileSync, log, repo, runs);
  return { repo, headSha, runs };
}
