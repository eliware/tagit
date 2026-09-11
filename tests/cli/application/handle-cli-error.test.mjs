import { jest } from '@jest/globals';
import { handleCliError } from '../../../src/cli/application/handle-cli-error.mjs';

test('logs and exits with the error message before rethrowing', () => {
  const log = { error: jest.fn() };
  const exit = jest.fn();
  const error = new Error('failure');
  expect(() => handleCliError(error, { log, exit })).toThrow(error);
  expect(log.error).toHaveBeenCalledWith(error);
  expect(exit).toHaveBeenCalledWith(1);
});

test('logs non-Error failures without a message property', () => {
  const log = { error: jest.fn() };
  const exit = jest.fn();
  expect(() => handleCliError('failure', { log, exit })).toThrow('failure');
  expect(log.error).toHaveBeenCalledWith('failure');
  expect(exit).toHaveBeenCalledWith(1);
});
