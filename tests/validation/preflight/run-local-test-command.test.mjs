import { jest } from '@jest/globals';
import { runLocalTestCommand } from '../../../src/validation/preflight/run-local-test-command.mjs';

test('returns a passing result for a successful command', () => {
  expect(runLocalTestCommand(jest.fn(), ['test', ['npm', ['test']]], 1000)).toEqual({
    result: { passed: true },
    failure: null,
  });
});

test('returns bounded failure diagnostics for a failed command', () => {
  const exec = jest.fn(() => {
    throw { stdout: 'failure', stderr: '' };
  });
  expect(runLocalTestCommand(exec, ['test', ['npm', ['test']]], 1000).failure).toContain('failure');
});
