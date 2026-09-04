import { readPublicationTarget } from '../../../src/commands/release-wait/read-publication-target.mjs';

test('reads public and private package publication targets', () => {
  const fs = { existsSync: () => true, readFileSync: () => JSON.stringify({ name: 'demo', private: true }) };
  expect(readPublicationTarget(fs)).toEqual({ packageName: 'demo', isPrivate: true });
});

test('returns no npm target when package metadata is absent', () => {
  expect(readPublicationTarget({ existsSync: () => true, readFileSync: () => JSON.stringify({}) })).toEqual({ packageName: null, isPrivate: false });
});
