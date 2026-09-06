import { jest } from '@jest/globals';
import { resolveUpstreamBranch } from '../../src/upstream/branch.mjs';

test('resolves advertised or fallback upstream branches', () => {
  expect(resolveUpstreamBranch(jest.fn(() => 'upstream/trunk\n'))).toBe('upstream/trunk');
  expect(resolveUpstreamBranch(jest.fn(() => ''))).toBe('upstream/main');
  expect(
    resolveUpstreamBranch(
      jest.fn(() => {
        throw new Error('missing');
      }),
    ),
  ).toBe('upstream/main');
});
