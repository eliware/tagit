import { jest } from '@jest/globals';
import { handleReleaseCiPollError } from '../../../src/commands/release-wait/handle-release-ci-poll-error.mjs';

test('rethrows malformed JSON immediately', async () => {
  await expect(handleReleaseCiPollError(new SyntaxError('bad'), 0, 3, 0, jest.fn())).rejects.toThrow(
    'malformed list JSON',
  );
});

test('sleeps for retryable errors and fails after the final attempt', async () => {
  const sleep = jest.fn();
  await expect(handleReleaseCiPollError(new Error('network'), 0, 2, 10, sleep)).resolves.toBeUndefined();
  expect(sleep).toHaveBeenCalledWith(10);
  await expect(handleReleaseCiPollError(new Error('network'), 1, 2, 10, sleep)).rejects.toThrow('after 2 attempts');
});
