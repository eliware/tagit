import { waitSync } from '../../process/timing/wait-sync.mjs';
import { readRepositoryName } from './read-repository-name.mjs';

export function reportCiLinks(execFileSync, log, headSha, { attempts = 1, delayMs = 2000 } = {}) {
  if (!Number.isInteger(attempts) || attempts < 1) throw new Error('CI link attempts must be a positive integer.');
  if (!Number.isFinite(delayMs) || delayMs < 0) throw new Error('CI link delay must be non-negative.');
  const repo = readRepositoryName(execFileSync);
  let runs = [];
  for (let attempt = 0; attempt < attempts && !runs.length; attempt += 1) {
    const parsed = JSON.parse(execFileSync('gh', ['run', 'list', '--repo', repo, '--commit', headSha, '--limit', '20', '--json', 'databaseId,url,headSha'], { encoding: 'utf8' }));
    if (!Array.isArray(parsed)) throw new Error('GitHub CI link response must be an array.');
    runs = parsed.filter(run => run.headSha === headSha);
    if (!runs.length && attempt + 1 < attempts) waitSync(delayMs);
  }
  if (!runs.length) {
    log.info(`No CI run exists yet for ${headSha}.`);
    return { repo, headSha, runs: [] };
  }
  runs.forEach(run => {
    log.info(`Workflow: [${run.url}](${run.url})`);
    const details = JSON.parse(execFileSync('gh', ['run', 'view', String(run.databaseId), '--repo', repo, '--json', 'jobs'], { encoding: 'utf8' }));
    (details.jobs ?? []).forEach(job => { if (job.url) log.info(`${job.name}: [${job.url}](${job.url})`); });
  });
  return { repo, headSha, runs };
}
