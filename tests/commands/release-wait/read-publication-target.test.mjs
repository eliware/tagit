import { readPublicationTarget } from '../../../src/commands/release-wait/read-publication-target.mjs';

test('reads public and private package publication targets', () => {
  const fs = { existsSync: () => true, readFileSync: () => JSON.stringify({ name: 'demo', private: true }) };
  expect(readPublicationTarget(fs)).toEqual({ applicable: true, packageName: 'demo', isPrivate: true });
});

test('returns no npm target when package metadata is absent', () => {
  expect(readPublicationTarget({ existsSync: () => false })).toEqual({ applicable: false, packageName: null, isPrivate: null });
});
test('classifies a private package without a name as applicable but non-publishing', () => {
  expect(readPublicationTarget({ existsSync: () => true, readFileSync: () => JSON.stringify({ private: true }) })).toEqual({ applicable: true, packageName: null, isPrivate: true });
});
test('rejects malformed publication names', () => {
  expect(() => readPublicationTarget({ existsSync: () => true, readFileSync: () => JSON.stringify({ name: 42 }) })).toThrow('must declare a name');
  expect(() => readPublicationTarget({ existsSync: () => true, readFileSync: () => JSON.stringify({ name: 'not valid' }) })).toThrow('invalid for publication');
});
test('rejects a public package without a name', () => {
  expect(() => readPublicationTarget({ existsSync: () => true, readFileSync: () => JSON.stringify({ private: false }) })).toThrow('must declare a name');
});
