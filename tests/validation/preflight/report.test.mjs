import { throwPreflightFailures } from '../../../src/validation/preflight/report.mjs';

test('does nothing when preflight has no failures', () => {
  expect(() => throwPreflightFailures([])).not.toThrow();
});

test('formats all preflight failures together', () => {
  expect(() => throwPreflightFailures(['first', 'second'])).toThrow('Preflight found 2 issue(s):\n\nfirst\n\nsecond');
});
