import { jest } from '@jest/globals';
import { getReleaseVersion, helpText, isCli, isHelp, parseOptions, preflightGuide, releaseGuide, runTagit } from '../bin/tagit.mjs';
import packageData from '../package.json' with { type: 'json' };

const noop = jest.fn();
const log = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };

test('supports release wait alongside preflight and release commands', () => {
  expect(parseOptions(['notes'])).toMatchObject({ command: 'notes', version: null });
  expect(parseOptions(['preflight'])).toMatchObject({ command: 'preflight', version: null });
  expect(parseOptions(['preflight', '--ignore-100x4'])).toMatchObject({ command: 'preflight', ignore100x4: true });
  expect(parseOptions(['push', '--dry-run'])).toMatchObject({ command: 'push', dryRun: true });
  expect(parseOptions(['release', '--version', packageData.version])).toMatchObject({ command: 'release', version: packageData.version });
  expect(parseOptions(['release-wait'])).toMatchObject({ command: 'release-wait', version: null });
  expect(() => parseOptions(['--check'])).toThrow('Unknown command');
  expect(() => parseOptions(['preflight', '--unknown'])).toThrow('Unknown option');
  expect(() => parseOptions(['preflight', '--dry-run', '--dry-run'])).toThrow('Duplicate option');
  expect(() => parseOptions(['preflight', '--version', '2.0.0'])).toThrow('requires release');
  expect(() => parseOptions(['release', '--version', 'next'])).toThrow('Invalid release version');
  expect(getReleaseVersion(['release'])).toBe(null);
  expect(helpText()).toContain('TAGIT RELEASE WORKFLOW');
});

test('provides complete self-contained operator guidance', () => {
  expect(preflightGuide()).toContain('npm pack --dry-run');
  expect(preflightGuide()).toContain('Ubuntu and Windows');
  expect(releaseGuide()).toContain('tagit release --version X.Y.Z');
  expect(releaseGuide()).toContain('publish jobs individually');
  expect(helpText()).toContain('release-wait');
});

test('detects CLI', () => {
  expect(isCli(['node', '/opt/tagit/bin/tagit.mjs'])).toBe(true);
  expect(isCli(['node', '/opt/test.mjs'])).toBe(false);
  expect(isCli(['node'])).toBe(false);
  expect(isHelp(['preflight', '--help'])).toBe(true);
});

test('supports top-level help and version flags', async () => {
  const output = jest.fn();
  await runTagit({ output }, ['--help']);
  expect(output).toHaveBeenCalledWith(expect.stringContaining('Project owners may run only'));
  await runTagit({ output }, ['--version']);
  expect(output).toHaveBeenLastCalledWith(packageData.version);
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await runTagit({}, ['-v']);
  expect(consoleSpy).toHaveBeenCalledWith(packageData.version);
  consoleSpy.mockRestore();
});

test('handles parse errors with a controlled exit', async () => {
  const exit = jest.fn();
  await runTagit({ exit, log }, ['unknown-command']);
  expect(log.error).toHaveBeenCalledWith('Unknown command: unknown-command');
  expect(exit).toHaveBeenCalledWith(1);
});

test('handles missing release version and default preflight output', async () => {
  expect(getReleaseVersion(['release', '--version', '-x'])).toBe(null);
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await runTagit({ runPreflight: jest.fn(() => ({ test: { passed: true } })), suggestVersion: noop, log, registerHandlersFn: noop, registerSignalsFn: noop }, ['preflight']);
  expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('"ok":true'));
  consoleSpy.mockRestore();
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
  await runTagit({ output, buildNotesReport: jest.fn(() => 'TAGIT NOTES REPORT'), suggestVersion: noop, log, registerHandlersFn: noop, registerSignalsFn: noop }, ['notes']);
  expect(output).toHaveBeenCalledWith('TAGIT NOTES REPORT');
});

test('notes uses console output when no output override is supplied', async () => {
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await runTagit({ buildNotesReport: jest.fn(() => 'report'), suggestVersion: noop, log, registerHandlersFn: noop, registerSignalsFn: noop }, ['notes']);
  expect(consoleSpy).toHaveBeenCalledWith('report');
  consoleSpy.mockRestore();
});

test('release runs the release operation for an explicit version', async () => {
  const updateVersionFiles = jest.fn().mockResolvedValue(packageData.version);
  const gitOperations = jest.fn();
  await runTagit({ updateVersionFiles, gitOperations, verifyRelease: noop, runPreflight: noop, suggestVersion: noop, log, registerHandlersFn: noop, registerSignalsFn: noop }, ['release', '--version', packageData.version]);
  expect(updateVersionFiles).toHaveBeenCalledWith(expect.anything(), log, { targetVersion: packageData.version });
  expect(gitOperations).toHaveBeenCalledWith(expect.any(Function), expect.anything(), log, packageData.version);
});

test('release passes the coverage waiver through preflight', async () => {
  const runPreflight = jest.fn(() => ({ test: { passed: true } }));
  const updateVersionFiles = jest.fn().mockResolvedValue(packageData.version);
  const gitOperations = jest.fn(() => ({ commitSha: 'abc' }));
  await runTagit({ updateVersionFiles, gitOperations, runPreflight, verifyRelease: noop, suggestVersion: noop, log, registerHandlersFn: noop, registerSignalsFn: noop }, ['release', '--version', packageData.version, '--ignore-100x4']);
  expect(runPreflight).toHaveBeenCalledWith(expect.anything(), expect.anything(), log, expect.objectContaining({ ignore100x4: true }));
});

test('release-wait monitors the latest tag without release side effects', async () => {
  const execSync = jest.fn();
  const execFileSync = jest.fn((command, args) => args[0] === 'describe' ? `v${packageData.version}` : 'abc');
  const verifyRelease = jest.fn().mockResolvedValue({});
  await runTagit({ execSync, execFileSync, verifyRelease, log, registerHandlersFn: noop, registerSignalsFn: noop }, ['release-wait']);
  expect(execFileSync).toHaveBeenCalledWith('git', ['rev-list', '-n', '1', `v${packageData.version}`]);
  expect(verifyRelease).toHaveBeenCalledWith(execFileSync, expect.anything(), log, { version: packageData.version, release: { commitSha: 'abc' }, execFile: expect.any(Function) });
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
  await runTagit({ runPreflight, updateVersionFiles, gitOperations, verifyRelease, log, registerHandlersFn: noop, registerSignalsFn: noop }, ['release', '--version', packageData.version, '--dry-run']);
  expect(runPreflight).toHaveBeenCalled();
  expect(updateVersionFiles).not.toHaveBeenCalled();
  expect(gitOperations).not.toHaveBeenCalled();
  expect(verifyRelease).not.toHaveBeenCalled();
});

test('push reports failures', async () => {
  const exit = jest.fn();
  await runTagit({ execFileSync: jest.fn(() => { throw new Error('push failed'); }), exit, log, registerHandlersFn: noop, registerSignalsFn: noop }, ['push']);
  expect(exit).toHaveBeenCalledWith(1);
});

test('release rejects a missing version and handles release failures', async () => {
  const exit = jest.fn();
  const error = jest.fn();
  await runTagit({ exit, log: { ...log, error }, suggestVersion: noop, registerHandlersFn: noop, registerSignalsFn: noop }, ['release']);
  expect(exit).toHaveBeenCalledWith(1);
  const failed = jest.fn().mockRejectedValue(new Error('failed'));
  await runTagit({ exit, log: { ...log, error }, updateVersionFiles: failed, runPreflight: noop, suggestVersion: noop, registerHandlersFn: noop, registerSignalsFn: noop }, ['release', '--version', packageData.version]);
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
