import { validateJobRecords } from './validate-job-records.mjs';
import { readCiRun } from './read-run.mjs';

export function summarizeCiJobs(execFileSync, candidates) {
  return candidates
    .map((run) => {
      const data = readCiRun(execFileSync, run.databaseId);
      const jobs = validateJobRecords(data.jobs, run.databaseId);
      return `run ${run.databaseId}: ${jobs.map((job) => `${job.name} [${job.status}/${job.conclusion}]`).join(', ')}`;
    })
    .join('; ');
}
