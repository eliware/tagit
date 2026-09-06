import { validateRunRecords } from './validate-run-records.mjs';
import { selectLatestRun, successfulRun } from './select-run.mjs';
import { verifyCompletedRun } from './verify-completed-run.mjs';
import { readCiRun } from './read-run.mjs';
import { pollPendingRun } from './poll-pending-run.mjs';
import { validateJobRecords } from './validate-job-records.mjs';

export function verifyLatestCi(
  execFileSync,
  log,
  { headSha, repository = null, waitForCompletion = true } = {},
  pollAttempt = 0,
  selectedRun = null,
) {
  if (!headSha) throw new Error('A commit SHA is required for CI verification.');
  const repoArg = repository ? ['--repo', repository] : [];
  const gh = (args, options = {}) => execFileSync('gh', args, { encoding: 'utf8', ...options });
  let runs;
  try {
    const args = selectedRun
      ? [
          'run',
          'view',
          String(selectedRun.databaseId),
          ...repoArg,
          '--json',
          'databaseId,status,conclusion,headSha,url',
        ]
      : [
          'run',
          'list',
          '--commit',
          headSha,
          ...repoArg,
          '--limit',
          '20',
          '--json',
          'databaseId,status,conclusion,headSha,url',
        ];
    const parsed = JSON.parse(gh(args));
    runs = validateRunRecords(
      selectedRun && !Array.isArray(parsed) ? [{ ...selectedRun, ...parsed }] : parsed,
      headSha,
    );
  } catch (error) {
    throw new Error(`Unable to inspect GitHub Actions runs for ${headSha}: ${error.message}`, { cause: error });
  }
  const latest = selectLatestRun(runs, headSha);
  if (
    latest?.status === 'completed' &&
    !['success', 'failure', 'cancelled', 'skipped', 'neutral', 'timed_out', 'action_required'].includes(
      latest.conclusion,
    )
  )
    throw new Error(
      `Latest GitHub Actions run ${latest.databaseId} has malformed completed conclusion: ${latest.conclusion}.`,
    );
  if (latest?.status === 'completed' && latest.conclusion !== 'success')
    throw new Error(`Latest GitHub Actions run ${latest.databaseId} failed with ${latest.conclusion}.`);
  const candidates = latest && successfulRun(latest) ? [latest] : [];
  const pending = latest?.status !== 'completed' ? latest : null;
  if (waitForCompletion && pollPendingRun(execFileSync, log, pending, repoArg, pollAttempt))
    return verifyLatestCi(
      execFileSync,
      log,
      { headSha, repository, waitForCompletion: true },
      pollAttempt + 1,
      pending,
    );
  if (!candidates.length) {
    const matching = runs.filter((run) => run.headSha === headSha);
    const details = matching.map((run) => `run ${run.databaseId} [${run.status}/${run.conclusion}]`).join(', ');
    throw new Error(`No successful GitHub Actions run exists for ${headSha}. Observed: ${details}`);
  }
  for (const run of candidates) {
    const result = verifyCompletedRun(execFileSync, log, run, headSha);
    if (result) return result;
  }
  const jobSummary = candidates
    .map((run) => {
      const data = readCiRun(execFileSync, run.databaseId);
      const jobs = validateJobRecords(data.jobs, run.databaseId);
      return `run ${run.databaseId}: ${jobs.map((job) => `${job.name} [${job.status}/${job.conclusion}]`).join(', ')}`;
    })
    .join('; ');
  throw new Error(`Successful GitHub Actions run for ${headSha} lacks a passing Ubuntu job. Jobs: ${jobSummary}`);
}
