import { processCommand } from '../../../src/validation/local/process-command.mjs';

test('resolves platform command wrappers while preserving arguments', () => {
  expect(processCommand('npm', ['test'], 'win32')).toEqual(['cmd.exe', ['/d', '/s', '/c', 'npm.cmd', 'test']]);
  expect(processCommand('npm', ['test'], 'linux')).toEqual(['npm', ['test']]);
  expect(processCommand('git', [], 'win32')).toEqual(['git', []]);
});
