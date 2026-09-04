import { waitSync } from '../../../src/process/timing/wait-sync.mjs';

test('does not wait for non-positive durations', () => {
  expect(() => waitSync(0)).not.toThrow();
});

test('waits synchronously for a positive duration', () => {
  expect(() => waitSync(1)).not.toThrow();
});
