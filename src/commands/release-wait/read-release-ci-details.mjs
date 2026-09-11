import { readGithubJson } from '../../github/cli/read-json.mjs';

export function readReleaseCiDetails(execFile, repo, databaseId) {
  return readGithubJson(execFile, 'gh', [
    'run',
    'view',
    String(databaseId),
    '--repo',
    repo,
    '--json',
    'databaseId,status,conclusion,headSha,jobs,url',
  ]);
}
