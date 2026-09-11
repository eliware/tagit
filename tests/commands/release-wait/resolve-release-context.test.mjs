import { jest } from '@jest/globals';
import { resolveReleaseContext } from '../../../src/commands/release-wait/resolve-release-context.mjs';

test('resolves repository, tag, and release head', () => {
  const execFileSync = jest.fn(() => 'https://github.com/eliware/demo.git');
  expect(resolveReleaseContext(execFileSync, '1.2.3', { commitSha: 'abc' })).toEqual({
    repo: 'eliware/demo',
    tag: 'v1.2.3',
    headSha: 'abc',
  });
});
