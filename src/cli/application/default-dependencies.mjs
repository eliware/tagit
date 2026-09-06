import { log, registerHandlers, registerSignals } from '@eliware/common';
import fs from 'node:fs';
import { execFileSync, execFile } from 'node:child_process';
import { gitOperations } from '../../git/release/operate-release.mjs';
import { runPreflight } from '../../validation/preflight/run-checks.mjs';
import { verifyRelease } from '../../commands/release-wait/verify-release.mjs';
import { buildNotesReport } from '../../commands/notes/build-report.mjs';
import { reportCiLinks } from '../../github/links/report-ci-links.mjs';
import packageData from '../../../package.json' with { type: 'json' };

export function defaultDependencies() {
  return {
    fs,
    execFileSync,
    execFile,
    log,
    gitOperations,
    runPreflight,
    verifyRelease,
    buildNotesReport,
    reportCiLinks,
    registerHandlersFn: registerHandlers,
    registerSignalsFn: registerSignals,
    exit: process.exit,
    packageVersion: packageData.version,
  };
}
