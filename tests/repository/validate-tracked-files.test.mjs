import { validateTrackedFiles } from '../../src/repository/validate-tracked-files.mjs';

test('reports secret-looking tracked paths', () => {
  const failures = [];
  validateTrackedFiles(() => '.env\ncredentials.json', failures);
  expect(failures.join('\n')).toContain('secret-looking');
});

test('reports Git inspection errors', () => {
  const failures = [];
  validateTrackedFiles(() => {
    throw new Error('unavailable');
  }, failures);
  expect(failures.join('\n')).toContain('tracked-file validation failed');
});
