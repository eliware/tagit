import { jest } from '@jest/globals';
import { dispatchPreflight } from '../../../src/commands/release/dispatch-preflight.mjs';

test('builds preflight options at the dispatch boundary', () => {
  const runPreflight = jest.fn();
  dispatchPreflight(
    { command: 'preflight', ignore100x4: true, ignoreMonolithLimits: false },
    { runPreflight, execFileSync: jest.fn(), fs: {}, log: { info: jest.fn() }, output: jest.fn() },
  );
  expect(runPreflight).toHaveBeenCalled();
});
