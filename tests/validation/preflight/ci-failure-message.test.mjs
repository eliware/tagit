import { ciFailureMessage } from '../../../src/validation/preflight/ci-failure-message.mjs';

test('formats a CI blocker with remediation', () => {
  expect(ciFailureMessage(new Error('failed'))).toContain('provide a successful Ubuntu run');
});

test('returns no failure for a successful CI result', () => {
  expect(ciFailureMessage(null)).toBeNull();
});
