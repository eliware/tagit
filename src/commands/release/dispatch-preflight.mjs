import { runPreflightCommand } from '../preflight/run-preflight.mjs';
import { preflightOptions } from './preflight-options.mjs';

export function dispatchPreflight(options, dependencies, report = true) {
  const { runPreflightCommand: run = runPreflightCommand, ...rest } = dependencies;
  return run({ ...rest, ...preflightOptions(options, report) });
}
