#!/usr/bin/env node
import { assembleDependencies } from './assemble-dependencies.mjs';
import { runCliBoundary } from './run-cli-boundary.mjs';
import { buildDispatchContext } from './build-dispatch-context.mjs';

export { getReleaseVersion, isHelp, parseOptions } from '../arguments/parse-options.mjs';
export { helpText } from '../guidance/help-text.mjs';
export { preflightGuide } from '../guidance/preflight-guide.mjs';
export { releaseGuide } from '../guidance/release-guide.mjs';

export async function runTagit(overrides = {}, argv = []) {
  const dependencies = assembleDependencies(overrides);
  dependencies.output = overrides.output ?? console.log;
  await runCliBoundary(buildDispatchContext(dependencies), argv);
}

export { isCli } from './is-cli.mjs';
