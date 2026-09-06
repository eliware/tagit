import { coverageWaiverPolicy } from '../../src/policy/coverage-waiver-policy.mjs';

test('only explicit true enables the DevOps waiver', () => {
  expect(coverageWaiverPolicy(false)).toEqual({ ignored: false, requiresDevOps: false });
  expect(coverageWaiverPolicy(true)).toEqual({ ignored: true, requiresDevOps: true });
});
