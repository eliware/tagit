import { readGithubJson } from '../../github/cli/read-json.mjs';
import { selectReleaseRun } from '../../github/runs/release-run-selection.mjs';

export async function readReleaseCiCandidate(execFile, repo, headSha, tag) {
  const runs = await readGithubJson(execFile, 'gh', [
    'run',
    'list',
    '--repo',
    repo,
    '--limit',
    '20',
    '--json',
    'databaseId,createdAt,headSha,headBranch',
  ]);
  return selectReleaseRun(runs, headSha, tag);
}
