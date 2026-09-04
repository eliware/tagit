import { validateOptions } from '../../../src/cli/arguments/validate-options.mjs';

test('accepts valid command options', () => {
  expect(() => validateOptions(['release', '--version', '1.2.3'], 'release')).not.toThrow();
});

test.each([
  [['release', '--bad'], 'Unknown option'],
  [['release', '--help', '--version', '1.2.3'], 'cannot be combined'],
  [['release', 'extra'], 'Unexpected positional'],
  [['release', '--dry-run', '--dry-run'], 'Duplicate'],
  [['release', '--version', '1.0.0', '--version', '1.0.0'], 'Duplicate'],
  [['release', '--help', '-h'], 'Duplicate'],
  [['notes', '--ignore-100x4'], 'requires preflight'],
  [['notes', '--ignore-monolith-limits'], 'requires preflight'],
  [['notes', '--dry-run'], 'requires push'],
  [['notes', '--version', '1.0.0'], 'requires release'],
  [['release-wait', '--version', '1.0.0'], 'latest tag'],
])('rejects invalid options: %s', (argv, message) => {
  expect(() => validateOptions(argv, argv[0])).toThrow(message);
});
