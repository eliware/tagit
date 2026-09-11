import { validateRunRecords } from './validate-run-records.mjs';

export function readExactHeadRuns(execFileSync, headSha, repository, selectedRun) {
  const repoArg = repository ? ['--repo', repository] : [];
  const args = selectedRun
    ? ['run', 'view', String(selectedRun.databaseId), ...repoArg, '--json', 'databaseId,status,conclusion,headSha,url']
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
  try {
    const parsed = JSON.parse(execFileSync('gh', args, { encoding: 'utf8' }));
    return {
      repoArg,
      runs: validateRunRecords(
        selectedRun && !Array.isArray(parsed) ? [{ ...selectedRun, ...parsed }] : parsed,
        headSha,
      ),
    };
  } catch (error) {
    throw new Error(`Unable to inspect GitHub Actions runs for ${headSha}: ${error.message}`, { cause: error });
  }
}
