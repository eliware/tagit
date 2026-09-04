import { parseVersionOption } from '../../../src/cli/arguments/parse-version-option.mjs';

test('reads and validates a release version', () => {
  expect(parseVersionOption(['--version', '2.3.4'])).toBe('2.3.4');
  expect(parseVersionOption([])).toBeNull();
});

test('rejects malformed or missing required versions', () => {
  expect(() => parseVersionOption(['--version', 'x'])).toThrow('Invalid release version');
  expect(() => parseVersionOption([], { required: true })).toThrow('required');
  expect(() => parseVersionOption(['--version', '--dry-run'], { required: true })).toThrow('required');
});
