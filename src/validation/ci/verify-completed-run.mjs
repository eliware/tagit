import { validateJobRecords } from './validate-job-records.mjs';
import { evaluateJobPolicy } from './evaluate-job-policy.mjs';

export function verifyCompletedRun(execFileSync, log, run, headSha) {
  const data = JSON.parse(execFileSync('gh', ['run', 'view', String(run.databaseId), '--json', 'status,conclusion,headSha,jobs'], { encoding: 'utf8' }));
  const jobs = validateJobRecords(data.jobs, run.databaseId);
  const successful = job => job.status === 'completed' && job.conclusion === 'success';
  const { failed, ubuntu, windows } = evaluateJobPolicy(jobs, successful);
  if (!failed && data.status === 'completed' && data.conclusion === 'success' && data.headSha === headSha && ubuntu && windows.passed) {
    log.info(`GitHub Actions CI verified for ${headSha}: Ubuntu passed${windows.successful ? '; Windows passed.' : '; Windows optional.'}`);
    return { runId: run.databaseId, headSha, ubuntu: true, windows: windows.successful };
  }
  return null;
}
