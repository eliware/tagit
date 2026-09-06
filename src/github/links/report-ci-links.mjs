import { waitSync } from '../../process/timing/wait-sync.mjs';
import { readRepositoryName } from './read-repository-name.mjs';

export function reportCiLinks(execFileSync, log, headSha, { attempts = 1, delayMs = 2000 } = {}) {
  if (!Number.isInteger(attempts) || attempts < 1) throw new Error('CI link attempts must be a positive integer.');
  if (!Number.isFinite(delayMs) || delayMs < 0) throw new Error('CI link delay must be non-negative.');
  const repo = readRepositoryName(execFileSync);
  let runs = [];
  for (let attempt = 0; attempt < attempts && !runs.length; attempt += 1) {
    const parsed = JSON.parse(
      execFileSync(
        'gh',
        ['run', 'list', '--repo', repo, '--commit', headSha, '--limit', '20', '--json', 'databaseId,url,headSha'],
        { encoding: 'utf8' },
      ),
    );
    if (!Array.isArray(parsed)) throw new Error('GitHub CI link response must be an array.');
    const malformed = parsed.filter(
      (run) =>
        !run ||
        typeof run !== 'object' ||
        !Number.isInteger(run.databaseId) ||
        typeof run.headSha !== 'string' ||
        typeof run.url !== 'string',
    );
    if (malformed.length)
      throw new Error(`GitHub CI link response contains malformed run records: ${malformed.length}.`);
    runs = parsed.filter((run) => run.headSha === headSha);
    if (!runs.length && attempt + 1 < attempts) waitSync(delayMs);
  }
  if (!runs.length) {
    log.info(`No CI run exists yet for ${headSha}.`);
    return { repo, headSha, runs: [] };
  }
  runs.slice(0, 5).forEach((run) => {
    log.info(`Workflow: [${run.url}](${run.url})`);
    const details = JSON.parse(
      execFileSync('gh', ['run', 'view', String(run.databaseId), '--repo', repo, '--json', 'jobs'], {
        encoding: 'utf8',
      }),
    );
    if (!Array.isArray(details.jobs))
      throw new Error(`GitHub CI run ${run.databaseId} returned malformed job records.`);
    const malformedJobs = details.jobs.filter(
      (job) =>
        !job ||
        typeof job !== 'object' ||
        typeof job.name !== 'string' ||
        (job.url !== undefined && typeof job.url !== 'string'),
    );
    if (malformedJobs.length)
      throw new Error(`GitHub CI run ${run.databaseId} returned malformed job records: ${malformedJobs.length}.`);
    details.jobs.forEach((job) => {
      if (job.url) log.info(`${job.name}: [${job.url}](${job.url})`);
    });
  });
  return { repo, headSha, runs };
}
