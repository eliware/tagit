import { jest } from '@jest/globals';
import { verifyRegistries } from '../../../src/commands/release-wait/verify-registries.mjs';
test('skips npm and GHCR when not applicable', async () => {
  await expect(
    verifyRegistries({
      fs: { existsSync: () => false },
      execFile: jest.fn(),
      log: { info: jest.fn() },
      repo: 'eliware/tagit',
      version: '1.0.0',
      release: {},
      packageName: null,
      isPrivate: true,
      maxPolls: 1,
      npmRetries: 1,
      pollMs: 1,
      npmRetryMs: 1,
      sleep: jest.fn(),
    }),
  ).resolves.toEqual({ npm: false, ghcr: false });
});
