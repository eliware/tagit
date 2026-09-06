import { jest } from '@jest/globals';
import { verifyGhcrPublication } from '../../../src/registries/ghcr/verify-publication.mjs';
function execWith(value, error = null) {
  return jest.fn((_command, _args, _options, callback) => callback(error, error ? '' : JSON.stringify(value), ''));
}
const digest = `sha256:${'a'.repeat(64)}`;
test('finds a tagged image and returns its digest', async () => {
  await expect(
    verifyGhcrPublication(
      execWith([{ name: digest, metadata: { container: { tags: ['v2.1.0'] } } }]),
      { info: jest.fn(), debug: jest.fn() },
      { repository: 'eliware/demo', version: '2.1.0', sleep: jest.fn() },
    ),
  ).resolves.toEqual({ imageDigest: digest });
});
test('flattens slurped pages and handles missing digest', async () => {
  await expect(
    verifyGhcrPublication(
      execWith([[{ name: digest, metadata: { container: { tags: ['v2.1.0'] } } }]]),
      { info: jest.fn() },
      { repository: 'eliware/demo', version: '2.1.0', sleep: jest.fn() },
    ),
  ).resolves.toHaveProperty('imageDigest');
  await expect(
    verifyGhcrPublication(
      execWith([{ metadata: { container: { tags: ['v1.0.0'] } } }]),
      { info: jest.fn() },
      { repository: 'eliware/demo', version: '1.0.0', sleep: jest.fn() },
    ),
  ).resolves.toEqual({ imageDigest: null });
});
test('rejects invalid repositories and digest mismatches', async () => {
  await expect(
    verifyGhcrPublication(jest.fn(), { info: jest.fn() }, { repository: 'invalid', version: '1.0.0' }),
  ).rejects.toThrow('Invalid GHCR repository');
  await expect(
    verifyGhcrPublication(
      execWith([{ name: digest, metadata: { container: { tags: ['v1.0.0'] } } }]),
      { info: jest.fn() },
      { repository: 'eliware/demo', version: '1.0.0', expectedDigest: `sha256:${'b'.repeat(64)}`, sleep: jest.fn() },
    ),
  ).rejects.toThrow('digest mismatch');
});
test('bounds transient failures and malformed responses', async () => {
  const sleep = jest.fn(async () => {});
  await expect(
    verifyGhcrPublication(
      execWith(null, new Error('temporary failure')),
      { info: jest.fn(), debug: jest.fn() },
      { repository: 'eliware/demo', version: '2.1.0', retries: 2, retryMs: 5, sleep },
    ),
  ).rejects.toThrow('does not expose');
  expect(sleep).toHaveBeenCalledWith(5);
  await expect(
    verifyGhcrPublication(
      execWith({ malformed: true }),
      { info: jest.fn(), debug: jest.fn() },
      { repository: 'eliware/demo', version: '1.0.0', retries: 1, sleep: jest.fn() },
    ),
  ).rejects.toThrow('does not expose');
});
