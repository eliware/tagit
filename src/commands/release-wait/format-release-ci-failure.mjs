export function formatReleaseCiFailure(details) {
  if (details.status !== 'completed' || details.conclusion === 'success') return null;
  const jobs = details.jobs.map((job) => `${job.name} [${job.status}/${job.conclusion}]`).join(', ');
  return `Release CI failed: ${String(details.conclusion)}. Jobs: ${jobs || 'none reported'}.`;
}
