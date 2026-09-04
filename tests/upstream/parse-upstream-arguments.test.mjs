import { parseUpstreamArguments } from '../../src/upstream/parse-upstream-arguments.mjs';

test('copies upstream arguments without mutation', () => {
  const args = ['sync'];
  expect(parseUpstreamArguments(args)).toEqual(args);
  expect(parseUpstreamArguments(args)).not.toBe(args);
});

test('rejects non-array arguments', () => {
  expect(() => parseUpstreamArguments('sync')).toThrow('must be an array');
  expect(parseUpstreamArguments()).toEqual([]);
});
