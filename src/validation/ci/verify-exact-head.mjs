import { validateRunRecords } from './validate-run-records.mjs';
import { selectLatestRun, successfulRun } from './select-run.mjs';
import { validateJobRecords } from './validate-job-records.mjs';
import { evaluateJobPolicy } from './evaluate-job-policy.mjs';

function readCiRun(execFileSync, runId) {
  const output = execFileSync('gh', ['run', 'view', String(runId), '--json', 'status,conclusion,headSha,jobs'], { encoding: 'utf8' });
  return JSON.parse(output);
}

export function verifyLatestCi(execFileSync, log, { headSha, repository = null, waitForCompletion = true } = {}, pollAttempt = 0) {
  if (!headSha) throw new Error('A commit SHA is required for CI verification.');
  const repoArg = repository ? ['--repo', repository] : [];
  const gh = (args, options = {}) => execFileSync('gh', args, { encoding: 'utf8', ...options });
  let runs;
  try { runs = validateRunRecords(JSON.parse(gh(['run', 'list', '--commit', headSha, ...repoArg, '--limit', '20', '--json', 'databaseId,status,conclusion,headSha,url'])), headSha); }
  catch (error) { throw new Error(`Unable to inspect GitHub Actions runs for ${headSha}: ${error.message}`, { cause: error }); }
  const latest = selectLatestRun(runs, headSha); const candidates = successfulRun(latest) ? [latest] : []; const pending = latest?.status !== 'completed' ? latest : null;
  if (pending && waitForCompletion && pollAttempt < 30) { if (pending.url) log.info(`CI in progress; waiting for completion: [workflow run ${pending.databaseId}](${pending.url})`); try { gh(['run', 'watch', String(pending.databaseId), ...repoArg, '--exit-status', '--interval', '10'], { timeout: 10000 }); } catch { /* Re-read completed state. */ } return verifyLatestCi(execFileSync, log, { headSha, repository, waitForCompletion: true }, pollAttempt + 1); }
  if (!candidates.length) { const matching = runs.filter(run => run.headSha === headSha); const details = matching.map(run => `${run.url ? `[run ${run.databaseId}](${run.url})` : `run ${run.databaseId}`} [${run.status}/${run.conclusion}]`).join(', '); throw new Error(`No successful GitHub Actions run exists for ${headSha}. Observed: ${details}`); }
  for (const run of candidates) {
    const data = readCiRun(execFileSync, run.databaseId);
    const jobs = validateJobRecords(data.jobs, run.databaseId); const successful = job => job.status === 'completed' && job.conclusion === 'success'; const { failed, ubuntu, windows } = evaluateJobPolicy(jobs, successful);
    if (!failed && data.status === 'completed' && data.conclusion === 'success' && data.headSha === headSha && ubuntu && windows.passed) { log.info(`GitHub Actions CI verified for ${headSha}: Ubuntu passed${windows.successful ? '; Windows passed.' : '; Windows optional.'}`); return { runId: run.databaseId, headSha, ubuntu: true, windows: windows.successful }; }
  }
  const jobSummary = candidates.map(run => { const data = readCiRun(execFileSync, run.databaseId); return `run ${run.databaseId}: ${data.jobs.map(job => `${job.name} [${job.status}/${job.conclusion}]`).join(', ')}`; }).join('; ');
  throw new Error(`Successful GitHub Actions run for ${headSha} lacks a passing Ubuntu job. Jobs: ${jobSummary}`);
}
