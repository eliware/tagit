import { jest } from '@jest/globals';
import { prepareReleaseTag } from '../../../src/git/release/prepare-release-tag.mjs';
test('prepares a tag from current HEAD', () => {
  const exec = jest.fn((command, args) => (args[0] === 'rev-parse' ? 'abc' : ''));
  expect(prepareReleaseTag(exec, { info: jest.fn() }, 'v1.2.3').currentHead).toBe('abc');
});
