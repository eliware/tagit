#!/usr/bin/env node
import { log as defaultLog, registerHandlers, registerSignals } from '@eliware/common';
import fsDefault from 'fs';
import { execFileSync as execFileSyncDefault, execFile as execFileDefault } from 'child_process';
import path from 'path';
import { gitOperations as gitOperationsDefault } from '../../git/release/operate-release.mjs';
import { runPreflight as runPreflightDefault } from '../../validation/preflight/run-checks.mjs';
import { verifyRelease as verifyReleaseDefault } from '../../commands/release-wait/verify-release.mjs';
import { buildNotesReport as buildNotesReportDefault } from '../../commands/notes/build-report.mjs';
import { reportCiLinks as reportCiLinksDefault } from '../../github/links/report-ci-links.mjs';
import { parseOptions } from '../arguments/parse-options.mjs';
import { dispatchCommand } from './dispatch-command.mjs';
import packageData from '../../../package.json' with { type: 'json' };

export { getReleaseVersion, isHelp, parseOptions } from '../arguments/parse-options.mjs';
export { helpText } from '../guidance/help-text.mjs';
export { preflightGuide } from '../guidance/preflight-guide.mjs';
export { releaseGuide } from '../guidance/release-guide.mjs';

const defaultDependencies = {
  fs: fsDefault, execFileSync: execFileSyncDefault, execFile: execFileDefault,
  log: defaultLog, gitOperations: gitOperationsDefault, runPreflight: runPreflightDefault,
  verifyRelease: verifyReleaseDefault, buildNotesReport: buildNotesReportDefault,
  reportCiLinks: reportCiLinksDefault, registerHandlersFn: registerHandlers,
  registerSignalsFn: registerSignals, exit: process.exit,
};

export async function runTagit(overrides = {}, argv = []) {
  const { fs, execFileSync, execFile, log, gitOperations, runPreflight, registerHandlersFn,
    registerSignalsFn, verifyRelease, buildNotesReport, reportCiLinks, exit } = { ...defaultDependencies, ...overrides };
  let options;
  try { options = parseOptions(argv); } catch (error) { log.error(error.message); exit(1); return; }
  try { await dispatchCommand(options, { fs, execFileSync, execFile, log, gitOperations, runPreflight, verifyRelease, buildNotesReport, reportCiLinks, registerHandlersFn, registerSignalsFn, exit, output: overrides.output ?? console.log, packageVersion: packageData.version }); }
  catch (error) { log.error('Invalid tagit invocation:', error); log.error(error); exit(1); }
}

export function isCli(argv) {
  const executable = argv[1] ? path.basename(argv[1].replaceAll('\\', '/')) : '';
  return executable === 'tagit' || executable === 'tagit.mjs';
}
