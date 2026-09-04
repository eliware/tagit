import { jest } from '@jest/globals';
import { readGithubJson } from '../../../src/github/cli/read-json.mjs';

test('reads JSON from the GitHub command adapter', async () => {
  const execFile = jest.fn((executable, args, options, callback) => callback(null, '{"ok":true}', ''));
  await expect(readGithubJson(execFile, 'gh', ['status'])).resolves.toEqual({ ok: true });
});
