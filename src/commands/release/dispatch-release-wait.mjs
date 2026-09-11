import { runReleaseWaitCommand } from '../release-wait/run-release-wait.mjs';

export function dispatchReleaseWait(options, dependencies) {
  const { runReleaseWaitCommand: run = runReleaseWaitCommand, ...rest } = dependencies;
  return run({ ...rest, options });
}
