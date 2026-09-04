export function validateJobRecords(jobs, runId) {
  if (!Array.isArray(jobs)) throw new Error(`GitHub Actions run ${runId} returned malformed job records: jobs must be an array. Action: inspect the workflow run metadata, then rerun tagit preflight.`);
  const malformed = jobs.map((job, index) => ({ job, index })).filter(({ job }) => !job || typeof job !== 'object' || typeof job.name !== 'string' || typeof job.status !== 'string' || typeof job.conclusion !== 'string');
  if (malformed.length) {
    const details = malformed.map(({ job, index }) => `job ${index + 1}: ${job === null ? 'null' : typeof job === 'object' ? JSON.stringify(job) : typeof job}`).join('; ');
    throw new Error(`GitHub Actions run ${runId} returned malformed job records: ${details}. Action: inspect the GitHub run metadata, then rerun tagit preflight.`);
  }
  return jobs;
}
