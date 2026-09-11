import { jest } from '@jest/globals';
import { readReleaseCiDetails } from '../../../src/commands/release-wait/read-release-ci-details.mjs';

test('reads details for a selected workflow', async () => {
  const execFile = jest.fn((_command, _args, _options, callback) =>
    callback(null, JSON.stringify({ databaseId: 7, status: 'completed', conclusion: 'success', jobs: [] }), ''),
  );
  await expect(readReleaseCiDetails(execFile, 'eliware/demo', 7)).resolves.toMatchObject({ databaseId: 7 });
});
