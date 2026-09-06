import { validateBranch } from '../../src/repository/validate-branch.mjs';

test('reports a non-main branch', () => {
  const failures = [];
  validateBranch((command, args) => (args[0] === 'branch' ? 'feature' : ''), failures);
  expect(failures.join('\n')).toContain('main');
});

test('reports branch inspection errors', () => {
  const failures = [];
  validateBranch(() => {
    throw new Error('unavailable');
  }, failures);
  expect(failures.join('\n')).toContain('branch validation failed');
});
