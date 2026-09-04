import { truncateOutput } from '../../../src/output/redaction/truncate-output.mjs';

test('formats empty and bounded output', () => {
  expect(truncateOutput('')).toContain('no output captured');
  expect(truncateOutput('abcdef', 3)).toContain('output truncated');
  expect(truncateOutput('abc', 3)).toContain('abc');
});
