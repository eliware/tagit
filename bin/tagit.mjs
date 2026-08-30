#!/usr/bin/env node
import { log as defaultLog, registerHandlers, registerSignals } from '@eliware/common';
import fsDefault from 'fs';
import { execSync as execSyncDefault, execFileSync as execFileSyncDefault } from 'child_process';
import path from 'path';
import { updateVersionFiles as updateVersionFilesDefault } from '../src/updateVersionFiles.mjs';
import { gitOperations as gitOperationsDefault } from '../src/gitOperations.mjs';
import { runPreflight as runPreflightDefault } from '../src/releaseChecks.mjs';
import { suggestVersion as suggestVersionDefault } from '../src/versionSuggestion.mjs';
import { verifyRelease as verifyReleaseDefault } from '../src/releaseVerification.mjs';
import { buildNotesReport as buildNotesReportDefault } from '../src/releaseNotesReport.mjs';
import { reportCiLinks as reportCiLinksDefault } from '../src/releaseVerification.mjs';
import packageData from '../package.json' with { type: 'json' };

const defaultDependencies = {
  fs: fsDefault,
  execSync: execSyncDefault,
  execFileSync: execFileSyncDefault,
  log: defaultLog,
  updateVersionFiles: updateVersionFilesDefault,
  gitOperations: gitOperationsDefault,
  runPreflight: runPreflightDefault,
  suggestVersion: suggestVersionDefault,
  verifyRelease: verifyReleaseDefault,
  buildNotesReport: buildNotesReportDefault,
  reportCiLinks: reportCiLinksDefault,
  registerHandlersFn: registerHandlers,
  registerSignalsFn: registerSignals,
  exit: process.exit,
};

const operatorBoundary = 'Project owners may run only tagit notes, tagit push, and tagit preflight. Project owners must never run tagit release or tagit release-wait; DevOps runs those commands only after preflight passes. DevOps may use --ignore-100x4 only with an approved documented waiver; all other gates remain required.';

export async function runTagit(overrides = {}, argv = []) {
  const {
    fs, execSync, execFileSync, log, updateVersionFiles, gitOperations, runPreflight, suggestVersion,
    registerHandlersFn, registerSignalsFn, verifyRelease, buildNotesReport, reportCiLinks, exit,
  } = { ...defaultDependencies, ...overrides };
  const options = parseOptions(argv);
  if (options.versionQuery) {
    (overrides.output ?? console.log)(packageData.version);
    return;
  }
  if (options.help || !options.command) {
    (overrides.output ?? console.log)(`${operatorBoundary}\n\n${helpText()}`);
    return;
  }
  registerHandlersFn({ log });
  registerSignalsFn({ log });
  if (options.command === 'notes') {
    (overrides.output ?? console.log)(buildNotesReport(execSync, fs));
    return;
  }
  if (options.command === 'push') {
    try {
      execSync('git push', { stdio: 'inherit' });
      const headSha = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
      reportCiLinks(execSync, log, headSha, { attempts: 10, delayMs: 2000 });
      log.info('Push completed; untracked files were not staged.');
    } catch (error) { log.error(error); exit(1); }
    return;
  }
  let versionSnapshots = [];
  try {
    if (options.command === 'release' && !options.version) {
      throw new Error('A specific release version is required. Use tagit release --version X.Y.Z.');
    }
  } catch (error) {
    log.error('Invalid tagit invocation:', error);
    exit(1);
    return;
  }

  try {
    if (options.command === 'release-wait') {
      const version = options.version ?? execSync('git describe --tags --abbrev=0').toString().trim().replace(/^v/, '');
      const commitSha = execSync(`git rev-list -n 1 v${version}`).toString().trim();
      await verifyRelease(execSync, fs, log, { version, release: { commitSha } });
      log.info(`Release ${version} verified successfully.`);
      return;
    }
    const preflight = runPreflight(execSync, fs, log, { verifyCi: true, strictRepository: true, ignore100x4: options.ignore100x4 });
    if (options.command === 'preflight') {
      log.info('Preflight passed: local gates and exact-HEAD Ubuntu/Windows CI are green.');
      (overrides.output ?? console.log)(JSON.stringify({ ok: true, checks: preflight }));
      return;
    }
    if (fs.existsSync('.notag')) {
      log.info('.notag detected: template release validated; tagging and publishing skipped.');
      return;
    }
    versionSnapshots = ['package.json', 'package-lock.json', 'composer.json']
      .filter(file => fs.existsSync(file))
      .map(file => [file, fs.readFileSync(file, 'utf8')]);
    const newVersion = await updateVersionFiles(fs, log, { targetVersion: options.version });
    log.info(`Updated version to ${newVersion}`);
    const release = gitOperations(execSync, fs, log, newVersion);
    await verifyRelease(execSync, fs, log, { version: newVersion, release, linksOnly: true });
    log.info('Run tagit release-wait to monitor CI and confirm publication.');
  } catch (error) {
    // Versioning happens before Git operations; restore it if any release step fails.
    for (const [file, contents] of versionSnapshots) fs.writeFileSync(file, contents, 'utf8');
    log.error(error);
    exit(1);
  }
}

export function isHelp(argv) {
  return argv.includes('--help') || argv.includes('-h');
}

export function getReleaseVersion(argv) {
  const index = argv.findIndex((argument) => argument === '--version');
  if (index === -1) return null;
  const value = argv[index + 1];
  if (!value || value.startsWith('-')) return null;
  if (!/^\d+\.\d+\.\d+$/.test(value)) throw new Error(`Invalid release version: ${value}`);
  return value;
}

export function parseOptions(argv) {
  const command = argv[0] && !['--help', '-h', '--version', '-v'].includes(argv[0]) ? argv[0] : undefined;
  if (command && !['notes', 'preflight', 'push', 'release', 'release-wait'].includes(command)) throw new Error(`Unknown command: ${command}`);
  return {
    command,
    help: isHelp(argv),
    versionQuery: !command && (argv.includes('--version') || argv.includes('-v')),
    ignore100x4: argv.includes('--ignore-100x4'),
    version: command === 'release' || command === 'release-wait' ? getReleaseVersion(argv) : null,
  };
}

export function helpText() {
  return `Usage: tagit <command>\n\nTAGIT RELEASE WORKFLOW\n\nResponsibility handoff:\n  Project owner  -> runs tagit notes, updates release notes/tests, and resolves all local issues.\n  Project owner  -> commits and pushes the finished work, then confirms CI is green.\n  DevOps admin   -> runs tagit preflight to independently verify the exact pushed HEAD.\n  DevOps admin   -> runs tagit release --version X.Y.Z, then shares the workflow links.\n  DevOps admin   -> runs tagit release-wait to monitor CI and confirm publication.\n\nCommands:\n  notes                     Report changes since the latest tag; read-only.\n  preflight                 Verify local gates and exact-HEAD Ubuntu/Windows CI; read-only.\n  push                      Push existing commits only; ignore untracked files and print CI links.\n  release --version X.Y.Z  Preflight, version, commit, tag, push, and print CI links.\n  release-wait              Wait for release CI; verify npm/GHCR and report final links.\n\nRequired gates:\n  100x4 coverage, zero lint warnings, audit, package validation, required project tests,\n  and successful Ubuntu and Windows CI for the exact commit. Failures are blockers.\n\nTemplates:\n  A .notag repository still runs preflight but never versions, tags, pushes, or publishes.\n\nOptions:\n  -h, --help                Show this overview\n  -v, --version             Show the installed tagit version`;
}

export function preflightGuide() {
  return `Preflight checklist (all required):
- Run from the repository root on a clean main worktree.
- Confirm .notag is absent and no secrets or unexplained changes exist.
- Confirm package metadata, README, release notes, and CI workflow are current.
- Run npm test: tests pass with 100% statements, branches, functions, and lines.
- Run npm run lint: zero errors and zero warnings.
- Run npm audit --omit=dev --audit-level=moderate: no blocking vulnerabilities.
- Run npm pack --dry-run: package contents are valid.
- Confirm gh reports a successful CI run for this exact HEAD, including Ubuntu and Windows.
- Confirm required smoke, integration, regression, and E2E checks pass when applicable.
Any missing, stale, pending, cancelled, failed, or mismatched check blocks handoff.`;
}

export function releaseGuide() {
  return `Release checklist (all required):
- Owner pre-release handoff is complete and the exact version is authorized.
- tagit preflight passes without waivers.
- The release version is explicit: tagit release --version X.Y.Z.
- Tagit updates the version, commits, creates vX.Y.Z, and pushes commit and tag.
- Verify the remote commit and tag point to the expected SHAs.
- Verify the tag workflow's Ubuntu, Windows, and publish jobs individually.
- Verify the exact package version and dist-tag in its target registry.
- tagit waits for release CI, then verifies npm after registry propagation delay and GHCR when applicable.
- Any CI, publish, npm, or GHCR failure is reported and exits nonzero; N/A registries are reported as skipped.
- Confirm the final worktree is clean; update GitOps only when deployment is authorized.
Never rerun an interrupted release blindly or bypass a failed gate.`;
}

export function isCli(argv) {
  const executable = argv[1] ? path.basename(argv[1]) : '';
  return executable === 'tagit' || executable === 'tagit.mjs';
}

// Keep imports safe for tests; execute only when used as the CLI.
