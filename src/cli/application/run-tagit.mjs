#!/usr/bin/env node
import { defaultDependencies } from './default-dependencies.mjs';
import { parseOptions } from '../arguments/parse-options.mjs';
import { dispatchCommand } from './dispatch-command.mjs';

export { getReleaseVersion, isHelp, parseOptions } from '../arguments/parse-options.mjs';
export { helpText } from '../guidance/help-text.mjs';
export { preflightGuide } from '../guidance/preflight-guide.mjs';
export { releaseGuide } from '../guidance/release-guide.mjs';

export async function runTagit(overrides = {}, argv = []) {
  // codescope ignore: this is the process-boundary coordinator; dependency assembly and termination are intentionally centralized here.
  const {
    fs,
    execFileSync,
    execFile,
    log,
    gitOperations,
    runPreflight,
    registerHandlersFn,
    registerSignalsFn,
    verifyRelease,
    buildNotesReport,
    reportCiLinks,
    exit,
    packageVersion,
  } = { ...defaultDependencies(), ...overrides };
  let options;
  try {
    options = parseOptions(argv);
  } catch (error) {
    log.error(error.message);
    exit(1);
    throw error;
  }
  try {
    await dispatchCommand(options, {
      fs,
      execFileSync,
      execFile,
      log,
      gitOperations,
      runPreflight,
      verifyRelease,
      buildNotesReport,
      reportCiLinks,
      registerHandlersFn,
      registerSignalsFn,
      exit,
      output: overrides.output ?? console.log,
      packageVersion,
    });
  } catch (error) {
    log.error(error);
    exit(1);
    throw error;
  }
}

export { isCli } from './is-cli.mjs';
