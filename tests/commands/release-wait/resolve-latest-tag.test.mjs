import { jest } from '@jest/globals';
import { resolveLatestReleaseTag } from '../../../src/commands/release-wait/resolve-latest-tag.mjs';

test('resolves and confirms the latest semantic release tag', () => {
  const exec = jest.fn((command, args) => (args[0] === 'describe' ? 'v1.2.3\n' : 'abc\n'));
  expect(resolveLatestReleaseTag(exec)).toEqual({ version: '1.2.3', commitSha: 'abc' });
});

test('rejects invalid or changing latest tags', () => {
  expect(() => resolveLatestReleaseTag(jest.fn(() => 'v-next'))).toThrow('not a semantic');
  let calls = 0;
  expect(() =>
    resolveLatestReleaseTag(jest.fn((command, args) => (args[0] === 'describe' ? 'v1.2.3' : calls++ ? 'def' : 'abc'))),
  ).toThrow('changed');
});
