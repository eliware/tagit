import { resolveExecutable } from '../../../src/process/commands/resolve-executable.mjs';

test('resolves Windows command shims only where required', () => {
  expect(resolveExecutable('npm', 'win32')).toBe('npm.cmd');
  expect(resolveExecutable('npx', 'win32')).toBe('npx.cmd');
  expect(resolveExecutable('composer', 'win32')).toBe('composer.cmd');
  expect(resolveExecutable('git', 'win32')).toBe('git');
  expect(resolveExecutable('npm', 'linux')).toBe('npm');
});
