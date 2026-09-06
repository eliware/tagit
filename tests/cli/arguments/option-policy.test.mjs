import {
  validateAllowedOptions,
  validateCommandPolicy,
  validateOptionDuplicates,
} from '../../../src/cli/arguments/option-policy.mjs';

test('validates option vocabulary and duplicate options', () => {
  expect(() => validateAllowedOptions(['release', '--bad'])).toThrow('Unknown option');
  expect(() => validateOptionDuplicates(['release', '--dry-run', '--dry-run'])).toThrow('Duplicate');
});

test('enforces command-specific option policy', () => {
  expect(() => validateCommandPolicy(['notes', '--dry-run'], 'notes')).toThrow('requires push');
  expect(() => validateCommandPolicy(['release-wait', '--version', '1.0.0'], 'release-wait')).toThrow('latest tag');
});
