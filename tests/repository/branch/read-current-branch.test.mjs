import { readCurrentBranch } from '../../../src/repository/branch/read-current-branch.mjs';
test('reads the current branch', () => {
  expect(readCurrentBranch(() => 'main\n')).toBe('main');
});
