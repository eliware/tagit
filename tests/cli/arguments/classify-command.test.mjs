import { classifyCommand } from '../../../src/cli/arguments/classify-command.mjs';

test('classifies supported and absent commands', () => {
  expect(classifyCommand(['release'])).toBe('release');
  expect(classifyCommand(['--help'])).toBeUndefined();
});

test('rejects misplaced and unknown commands', () => {
  expect(() => classifyCommand(['--help', 'release'])).toThrow('command must precede');
  expect(() => classifyCommand(['nope'])).toThrow('Unknown command');
});
