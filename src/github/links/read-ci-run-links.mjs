export function readCiRuns(execFileSync, repo, headSha) {
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
  if (malformed.length) throw new Error(`GitHub CI link response contains malformed run records: ${malformed.length}.`);
  return parsed.filter((run) => run.headSha === headSha);
}
