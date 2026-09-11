import { jest } from '@jest/globals';
import { resolveReleaseContext } from '../../../src/commands/release-wait/resolve-release-context.mjs';

test('resolves repository, tag, and release head', () => {
  const execFileSync = jest.fn((command, args) => (args[0] === 'rev-parse' ? 'abc' : 'https://github.com/eliware/demo.git'));
  expect(resolveReleaseContext(execFileSync, '1.2.3', { commitSha: 'abc' })).toEqual({
    repo: 'eliware/demo',
    tag: 'v1.2.3',
    headSha: 'abc',
  });
});

test('rejects a release commit that does not match the tag', () => {
  const execFileSync = jest.fn((command, args) => (args[0] === 'rev-parse' ? 'def' : 'https://github.com/eliware/demo.git'));
  expect(() => resolveReleaseContext(execFileSync, '1.2.3', { commitSha: 'abc' })).toThrow('not the supplied commit');
});
