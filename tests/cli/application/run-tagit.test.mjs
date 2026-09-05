import { jest } from '@jest/globals';
import { execFileSync } from 'node:child_process';
import { isCli, runTagit } from '../../../src/cli/application/run-tagit.mjs';
import packageData from '../../../package.json' with { type: 'json' };
const noop = jest.fn();
const log = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
const testArgv = process.argv;
beforeAll(() => { process.argv = ['node', 'tagit']; });
afterAll(() => { process.argv = testArgv; });
test('runs the public CLI help entry point from the repository root', () => {
  const output = execFileSync(process.execPath, ['bin/tagit-cli.mjs', '--help'], { encoding: 'utf8' });
  expect(output).toContain('Usage: tagit');
}); test('runs the public notes entry point from the repository root', () => {
  const output = execFileSync(process.execPath, ['bin/tagit-cli.mjs', 'notes'], { encoding: 'utf8' });
  expect(output).toContain('TAGIT NOTES REPORT');
}); test('handles CLI help, version, and parse-error boundaries', async () => {
  const output = jest.fn();
  const exit = jest.fn();
  await runTagit({ output }, ['--help']);
  expect(output).toHaveBeenCalledWith(expect.stringContaining('Project owners may run only'));
  await runTagit({ output }, ['--version']);
  expect(output).toHaveBeenLastCalledWith(packageData.version);
  await expect(runTagit({ exit, log }, ['unknown-command'])).rejects.toThrow('Unknown command');
  expect(exit).toHaveBeenCalledWith(1);
});
test('uses console output for default version and preflight responses', async () => {
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await runTagit({}, ['-v']);
  expect(consoleSpy).toHaveBeenCalledWith(packageData.version);
  await runTagit({ runPreflight: jest.fn(() => ({ test: { passed: true } })), suggestVersion: noop, log, registerHandlersFn: noop, registerSignalsFn: noop }, ['preflight']);
  expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('"ok":true'));
  consoleSpy.mockRestore();
});
test('detects the supported CLI entrypoint names', () => {
  expect(isCli(['node', '/opt/tagit/bin/tagit.mjs'])).toBe(true);
  expect(isCli(['node', '/opt/test.mjs'])).toBe(false);
  expect(isCli(['node'])).toBe(false);
});
test('preflight runs without release side effects', async () => {
  const output = jest.fn();
  const runPreflight = jest.fn(() => ({ test: { passed: true } }));
  const updateVersionFiles = jest.fn();
  await runTagit({ output, runPreflight, updateVersionFiles, suggestVersion: noop, log, registerHandlersFn: noop, registerSignalsFn: noop }, ['preflight']);
  expect(runPreflight).toHaveBeenCalled();
  expect(updateVersionFiles).not.toHaveBeenCalled();
  expect(output).toHaveBeenCalledWith(JSON.stringify({ ok: true, checks: { test: { passed: true } } }));
});
test('passes the explicit coverage waiver to preflight', async () => {
  const runPreflight = jest.fn(() => ({ test: { passed: true } }));
  await runTagit({ output: jest.fn(), runPreflight, log, registerHandlersFn: noop, registerSignalsFn: noop }, ['preflight', '--ignore-100x4']);
  expect(runPreflight).toHaveBeenCalledWith(expect.anything(), expect.anything(), log, expect.objectContaining({ ignore100x4: true }));
});
test('notes prints the generated report without release side effects', async () => {
  const output = jest.fn();
  const buildNotesReport = jest.fn(() => 'TAGIT NOTES REPORT');
  const gitOperations = jest.fn();
  await runTagit({ output, buildNotesReport, gitOperations, suggestVersion: noop, log, registerHandlersFn: noop, registerSignalsFn: noop }, ['notes']);
  expect(buildNotesReport).toHaveBeenCalledWith(expect.anything(), expect.anything());
  expect(gitOperations).not.toHaveBeenCalled();
  expect(output).toHaveBeenCalledWith('TAGIT NOTES REPORT');
});

test('notes uses console output when no output override is supplied', async () => {
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await runTagit({ buildNotesReport: jest.fn(() => 'report'), suggestVersion: noop, log, registerHandlersFn: noop, registerSignalsFn: noop }, ['notes']);
  expect(consoleSpy).toHaveBeenCalledWith('report');
  consoleSpy.mockRestore();
});
test('release runs the release operation for an explicit version', async () => {
  const gitOperations = jest.fn();
  await runTagit({ gitOperations, verifyRelease: noop, runPreflight: noop, log, registerHandlersFn: noop, registerSignalsFn: noop }, ['release', '--version', packageData.version]);
  expect(gitOperations).toHaveBeenCalledWith(expect.any(Function), expect.anything(), log, packageData.version, { dryRun: false });
});
test('release does not invoke git operations when preflight fails', async () => {
  const gitOperations = jest.fn();
  const exit = jest.fn();
  await expect(runTagit({ gitOperations, exit, runPreflight: jest.fn(() => { throw new Error('preflight failed'); }), log, registerHandlersFn: noop, registerSignalsFn: noop }, ['release', '--version', packageData.version])).rejects.toThrow('preflight failed');
  expect(gitOperations).not.toHaveBeenCalled();
});
test('release blocks when package metadata does not match the explicit version', async () => {
  const gitOperations = jest.fn();
  const exit = jest.fn(() => { throw new Error('exit'); });
  await expect(runTagit({ gitOperations, verifyRelease: noop, runPreflight: noop, suggestVersion: noop, log, exit, registerHandlersFn: noop, registerSignalsFn: noop }, ['release', '--version', '9.9.9']))
    .rejects.toThrow('exit');
  expect(log.error).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('package.json version') }));
  expect(gitOperations).not.toHaveBeenCalled();
});
test('release permits a repository without package metadata to reach tag operations', async () => {
  const gitOperations = jest.fn();
  await runTagit({
    fs: { existsSync: jest.fn(() => false), readFileSync: jest.fn() },
    gitOperations,
    verifyRelease: noop,
    runPreflight: noop,
    suggestVersion: noop,
    log,
    registerHandlersFn: noop,
    registerSignalsFn: noop,
  }, ['release', '--version', packageData.version]);
  expect(gitOperations).toHaveBeenCalled();
});

test('release passes the coverage waiver through preflight', async () => {
  const runPreflight = jest.fn(() => ({ test: { passed: true } }));
  const updateVersionFiles = jest.fn().mockResolvedValue(packageData.version);
  const gitOperations = jest.fn(() => ({ commitSha: 'abc' }));
  await runTagit({ updateVersionFiles, gitOperations, runPreflight, verifyRelease: noop, suggestVersion: noop, log, registerHandlersFn: noop, registerSignalsFn: noop }, ['release', '--version', packageData.version, '--ignore-100x4']);
  expect(runPreflight).toHaveBeenCalledWith(expect.anything(), expect.anything(), log, expect.objectContaining({ ignore100x4: true }));
});

test('release-wait verifies the latest tag without release side effects', async () => {
  const execSync = jest.fn();
  const execFileSync = jest.fn((command, args) => args[0] === 'describe' ? `v${packageData.version}` : 'abc');
  const verifyRelease = jest.fn().mockResolvedValue({});
  await runTagit({ execSync, execFileSync, verifyRelease, log, registerHandlersFn: noop, registerSignalsFn: noop }, ['release-wait']);
  expect(execFileSync).toHaveBeenCalledWith('git', ['rev-list', '-n', '1', `v${packageData.version}`]);
  expect(verifyRelease).toHaveBeenCalledWith(execFileSync, expect.anything(), log, { version: packageData.version, release: { commitSha: 'abc' }, execFile: expect.any(Function) });
});

test('release-wait rejects an explicit version because it always follows the latest tag', async () => {
  const exit = jest.fn(() => { throw new Error('exit'); });
  await expect(runTagit({ log, exit, registerHandlersFn: noop, registerSignalsFn: noop }, ['release-wait', '--version', packageData.version]))
    .rejects.toThrow('exit');
  expect(log.error).toHaveBeenCalledWith(expect.stringContaining('always verifies the latest tag'));
});


test('push pushes commits without staging and reports CI links', async () => {
  const output = jest.fn();
  const execSync = jest.fn();
  const execFileSync = jest.fn((command, args) => args[0] === 'rev-parse' ? 'abc' : '');
  const reportCiLinks = jest.fn();
  await runTagit({ output, execSync, execFileSync, reportCiLinks, log, registerHandlersFn: noop, registerSignalsFn: noop }, ['push']);
  expect(execFileSync).toHaveBeenCalledWith('git', ['push'], { stdio: 'inherit' });
  expect(reportCiLinks).toHaveBeenCalledWith(execFileSync, log, 'abc', { attempts: 10, delayMs: 2000 });
});

test('push dry run performs no push or CI lookup', async () => {
  const execFileSync = jest.fn();
  await runTagit({ execFileSync, log, registerHandlersFn: noop, registerSignalsFn: noop }, ['push', '--dry-run']);
  expect(execFileSync).not.toHaveBeenCalled();
  expect(log.info).toHaveBeenCalledWith(expect.stringContaining('Dry run'));
});

test('release dry run preflights without changing or publishing anything', async () => {
  const runPreflight = jest.fn(() => ({ test: { passed: true } }));
  const updateVersionFiles = jest.fn();
  const gitOperations = jest.fn();
  const verifyRelease = jest.fn();
  await runTagit({ runPreflight, updateVersionFiles, gitOperations, verifyRelease, log, output: jest.fn(), registerHandlersFn: noop, registerSignalsFn: noop }, ['release', '--version', packageData.version, '--dry-run']);
  expect(runPreflight).toHaveBeenCalled();
  expect(updateVersionFiles).not.toHaveBeenCalled();
  expect(gitOperations).not.toHaveBeenCalled();
  expect(verifyRelease).not.toHaveBeenCalled();
});

test('push reports failures', async () => {
  const exit = jest.fn();
  await expect(runTagit({ execFileSync: jest.fn(() => { throw new Error('push failed'); }), exit, log, registerHandlersFn: noop, registerSignalsFn: noop }, ['push'])).rejects.toThrow('push failed');
  expect(exit).toHaveBeenCalledWith(1);
});

test('release rejects a missing version and handles release failures', async () => {
  const exit = jest.fn();
  const error = jest.fn();
  await expect(runTagit({ exit, log: { ...log, error }, suggestVersion: noop, registerHandlersFn: noop, registerSignalsFn: noop }, ['release'])).rejects.toThrow();
  expect(exit).toHaveBeenCalledWith(1);
  const failed = jest.fn().mockRejectedValue(new Error('failed'));
  await expect(runTagit({ exit, log: { ...log, error }, updateVersionFiles: failed, runPreflight: noop, suggestVersion: noop, registerHandlersFn: noop, registerSignalsFn: noop }, ['release', '--version', packageData.version])).rejects.toThrow('already points');
  expect(exit).toHaveBeenCalledWith(1);
});

test('bare invocation displays help', async () => {
  const output = jest.fn();
  await runTagit({ output }, []);
  expect(output).toHaveBeenCalledWith(expect.stringContaining('TAGIT RELEASE WORKFLOW'));
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await runTagit({}, []);
  expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('TAGIT RELEASE WORKFLOW'));
  consoleSpy.mockRestore();
});
test('notag exits before release', async () => {
  const exit = jest.fn();
  const updateVersionFiles = jest.fn();
  const runPreflight = jest.fn(() => ({ test: { passed: true } }));
  await runTagit({ fs: { existsSync: jest.fn(() => true) }, exit, updateVersionFiles, runPreflight, suggestVersion: noop, log, registerHandlersFn: noop, registerSignalsFn: noop }, ['release', '--version', packageData.version]);
  expect(runPreflight).toHaveBeenCalled();
  expect(exit).not.toHaveBeenCalled();
  expect(updateVersionFiles).not.toHaveBeenCalled();
});
// codescope ignore: the default invocation is an intentional production-boundary smoke test.
test('uses default arguments when runTagit is called without arguments', async () => {
  await runTagit();
});
test('preserves failure after the exit boundary is stubbed', async () => {
  const realExit = process.exit;
  process.exit = jest.fn();
  try { await expect(runTagit({ log }, ['unknown-command'])).rejects.toThrow(); }
  finally { process.exit = realExit; }
});
