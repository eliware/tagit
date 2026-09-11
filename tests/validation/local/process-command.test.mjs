import { processCommand } from '../../../src/validation/local/process-command.mjs';

test('resolves platform command wrappers while preserving arguments', () => {
  expect(processCommand('npm', ['test'], 'win32')).toEqual(['cmd.exe', ['/d', '/s', '/c', 'npm.cmd', 'test']]);
  expect(processCommand('npm', ['test'], 'linux')).toEqual(['npm', ['test']]);
  expect(processCommand('git', [], 'win32')).toEqual(['git', []]);
});
test('resolves Windows npm through cmd.exe', () => {
  expect(processCommand('npm', ['test'], 'win32', 'C:\\node\\node.exe')).toEqual([
    'cmd.exe',
    ['/d', '/s', '/c', 'npm.cmd', 'test'],
  ]);
});

test('keeps non-Windows process commands unchanged', () => {
  expect(processCommand('npm', ['test'], 'linux', '/usr/bin/node')).toEqual(['npm', ['test']]);
});
