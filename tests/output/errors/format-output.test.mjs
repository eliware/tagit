import { outputText } from '../../../src/output/errors/format-output.mjs';

test('formats empty, redacted, and bounded output', () => {
  expect(outputText('')).toContain('(no output captured)');
  expect(outputText('token=secret')).toContain('[REDACTED]');
  expect(outputText('x'.repeat(5000))).toContain('output truncated');
});
