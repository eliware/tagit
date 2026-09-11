import { runReleaseCommand } from './run-release.mjs';

export function dispatchReleaseOperation(options, dependencies) {
  const { runReleaseCommand: run = runReleaseCommand, ...rest } = dependencies;
  return run({ options, ...rest });
}
