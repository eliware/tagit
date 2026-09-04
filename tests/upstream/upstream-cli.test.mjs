import { isUpstreamCli } from '../../src/upstream/upstream-cli.mjs';

test('recognizes upstream executable names', () => {
  expect(isUpstreamCli(['node', 'C:\\bin\\upstream.mjs'])).toBe(true);
  expect(isUpstreamCli(['node', 'tagit.mjs'])).toBe(false);
  expect(isUpstreamCli(['node'])).toBe(false);
});
