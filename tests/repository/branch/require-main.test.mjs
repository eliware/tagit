import { requireMain } from '../../../src/repository/branch/require-main.mjs';
test('allows main and blocks other or detached states', () => {
  expect(requireMain('main')).toBeNull();
  expect(requireMain('dev')).toContain('current branch');
  expect(requireMain('')).toContain('detached');
});
