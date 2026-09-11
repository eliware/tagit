import { formatParseError } from '../../../src/cli/application/format-parse-error.mjs';

test('formats errors by message and preserves non-error parse failures', () => {
  expect(formatParseError(new Error('invalid option'))).toBe('invalid option');
  expect(formatParseError('invalid option')).toBe('invalid option');
  expect(formatParseError(null)).toBeNull();
});
