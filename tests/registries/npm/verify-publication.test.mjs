import { jest } from '@jest/globals';
import { verifyNpmPublication } from '../../../src/registries/npm/verify-publication.mjs';

test('waits for npm visibility and succeeds at the expected version', async () => {
  let attempts = 0; const exec = jest.fn((_command, _args, _options, callback) => callback(null, attempts++ === 0 ? '2.0.0' : '2.1.0', ''));
  const sleep = jest.fn(async () => {});
  await expect(verifyNpmPublication(exec, { debug: jest.fn() }, { packageName: '@eliware/demo', version: '2.1.0', retries: 2, retryMs: 10, sleep })).resolves.toBeUndefined();
  expect(sleep).toHaveBeenCalledWith(10);
});
test('reports bounded npm visibility failures', async () => {
  const exec = jest.fn((_command, _args, _options, callback) => callback(new Error('registry unavailable'), '', ''));
  const sleep = jest.fn(async () => {});
  await expect(verifyNpmPublication(exec, { debug: jest.fn() }, { packageName: 'demo', version: '1.0.0', retries: 2, sleep })).rejects.toThrow('after 2 attempts');
  expect(sleep).toHaveBeenCalledTimes(1);
});
