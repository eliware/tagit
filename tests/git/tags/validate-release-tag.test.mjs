import { validateCurrentHead } from '../../../src/git/tags/validate-release-tag.mjs';

test('validates current and existing tag heads', () => {
  expect(validateCurrentHead('abc', 'def')).toEqual({ currentHead: 'abc', existingTagHead: 'def' });
  expect(() => validateCurrentHead('bad-head', null)).toThrow('valid current HEAD');
  expect(() => validateCurrentHead('abc', 'bad-tag')).toThrow('verify existing');
});
