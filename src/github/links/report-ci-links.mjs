import { readRepositoryName } from './read-repository-name.mjs';
import { readCiRuns } from './read-ci-run-links.mjs';
import { reportCiRunLinks } from './report-ci-run-links.mjs';

export function reportCiLinks(execFileSync, log, headSha) {
  const repo = readRepositoryName(execFileSync);
  const runs = readCiRuns(execFileSync, repo, headSha);
  if (!runs.length) {
    log.info(`No CI run exists yet for ${headSha}.`);
    return { repo, headSha, runs: [] };
  }
  reportCiRunLinks(execFileSync, log, repo, runs);
  return { repo, headSha, runs };
}
