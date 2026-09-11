import { jest } from '@jest/globals';
import { dispatchReleaseWait } from '../../../src/commands/release/dispatch-release-wait.mjs';

test('passes release-wait dependencies to the command boundary', async () => {
  const run = jest.fn();
  await dispatchReleaseWait({ command: 'release-wait' }, { runReleaseWaitCommand: run });
});
