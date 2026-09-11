import { jest } from '@jest/globals';
import { dispatchReleaseOperation } from '../../../src/commands/release/dispatch-release-operation.mjs';

test('passes release operation dependencies without policy logic', async () => {
  const runReleaseCommand = jest.fn();
  await dispatchReleaseOperation({ version: '1.0.0' }, { runReleaseCommand });
});
