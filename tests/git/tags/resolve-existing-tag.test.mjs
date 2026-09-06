import { jest } from '@jest/globals';
import { resolveExistingTag } from '../../../src/git/tags/resolve-existing-tag.mjs';

test('resolves missing, reusable, and conflicting tags', () => {
  expect(
    resolveExistingTag(
      jest.fn(() => ''),
      'v1.0.0',
      'abc',
    ),
  ).toEqual({ existingTagHead: null, reuse: false });
  const same = jest.fn((command, args) => (args[0] === 'tag' ? 'v1.0.0' : 'abc'));
  expect(resolveExistingTag(same, 'v1.0.0', 'abc')).toEqual({ existingTagHead: 'abc', reuse: true });
  const other = jest.fn((command, args) => (args[0] === 'tag' ? 'v1.0.0' : 'def'));
  expect(resolveExistingTag(other, 'v1.0.0', 'abc')).toEqual({ existingTagHead: 'def', reuse: false });
});
