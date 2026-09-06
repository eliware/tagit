export function validateRunRecords(runs, headSha) {
  if (!Array.isArray(runs)) throw new Error('GitHub CI run response must be an array.');
  const malformed = runs
    .map((run, index) => ({ run, index }))
    .filter(
      ({ run }) =>
        !run ||
        typeof run !== 'object' ||
        !Number.isInteger(run.databaseId) ||
        typeof run.status !== 'string' ||
        typeof run.conclusion !== 'string' ||
        typeof run.headSha !== 'string',
    );
  if (malformed.length) {
    const details = malformed
      .map(
        ({ run, index }) =>
          `entry ${index + 1}: ${run === null ? 'null' : typeof run === 'object' ? JSON.stringify(run) : typeof run}`,
      )
      .join('; ');
    throw new Error(
      `GitHub Actions returned malformed CI run records for ${headSha}: ${details}. Action: inspect the GitHub CLI response or workflow metadata, then rerun tagit preflight.`,
    );
  }
  return runs;
}
