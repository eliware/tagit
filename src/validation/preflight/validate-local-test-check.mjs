import { buildTestCheck } from '../local/test-command.mjs';
import { coverageWaiverPolicy } from '../../policy/coverage-waiver-policy.mjs';

export function validateLocalTestCheck(fs, { ignore100x4, ignoreMonolithLimits }) {
  return buildTestCheck(fs, {
    ignore100x4: coverageWaiverPolicy(ignore100x4).ignored,
    ignoreMonolithLimits,
  });
}
