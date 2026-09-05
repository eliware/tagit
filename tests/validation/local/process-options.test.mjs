import { processOptions } from '../../../src/validation/local/process-options.mjs';

test('keeps Windows command execution shell-free', () => {
  expect(processOptions('cmd.exe', 120000)).toEqual({ stdio: 'pipe', timeout: 120000, windowsVerbatimArguments: true });
});

test('keeps normal executables shell-free', () => {
  expect(processOptions('node', 120000)).toEqual({ stdio: 'pipe', timeout: 120000 });
});
