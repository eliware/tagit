import { processOptions } from '../../../src/validation/local/process-options.mjs';

test('enables shell mode for Windows command shims', () => {
  expect(processOptions('npm.cmd', 120000)).toMatchObject({ stdio: 'pipe', timeout: 120000, shell: true });
});

test('keeps normal executables shell-free', () => {
  expect(processOptions('node', 120000)).toEqual({ stdio: 'pipe', timeout: 120000 });
});
