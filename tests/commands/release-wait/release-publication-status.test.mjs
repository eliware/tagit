import { jest } from '@jest/globals';
import { verifyReleasePublication } from '../../../src/commands/release-wait/release-publication-status.mjs';

test('reports a public npm publication and skips GHCR when not declared', async () => {
  const fs = { existsSync: file => file === 'package.json', readFileSync: () => JSON.stringify({ name: 'demo', private: true }) };
  const run = { jobs: [{ name: 'Ubuntu', status: 'completed', conclusion: 'success', url: 'u' }] };
  await expect(verifyReleasePublication({ fs, execFile: jest.fn(), log: { info: jest.fn() }, repo: 'eliware/demo', tag: 'v1.0.0', headSha: 'abc', version: '1.0.0', run, release: {}, maxPolls: 1, npmRetries: 1, pollMs: 0, npmRetryMs: 0, sleep: jest.fn() })).resolves.toMatchObject({ ci: true, npm: false, ghcr: false });
});
