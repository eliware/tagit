import { mergeMessage } from '../../src/upstream/merge-message.mjs';

test('builds safe supplied or timestamp merge messages', () => {
  expect(mergeMessage(['merge'])).toBe('merge');
  expect(mergeMessage([], new Date('2026-07-29T18:07:59Z'))).toBe('2026-07-29 18:07:59');
  expect(() => mergeMessage(['bad\nmessage'])).toThrow('unsupported control characters');
  expect(() => mergeMessage(['x'.repeat(501)])).toThrow('too long');
});
