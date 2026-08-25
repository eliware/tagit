import { jest } from '@jest/globals';
import { getReleaseVersion, helpText, isCli, isHelp, parseOptions, preflightGuide, releaseGuide, runTagit } from '../bin/tagit.mjs';

const noop = jest.fn();
const log = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };

test('supports only preflight and release commands', () => {
  expect(parseOptions(['notes'])).toMatchObject({ command: 'notes', version: null });
  expect(parseOptions(['preflight'])).toMatchObject({ command: 'preflight', version: null });
  expect(parseOptions(['release', '--version', '2.4.0'])).toMatchObject({ command: 'release', version: '2.4.0' });
  expect(() => parseOptions(['--check'])).toThrow('Unknown command');
  expect(() => parseOptions(['release', '--version', 'next'])).toThrow('Invalid release version');
  expect(getReleaseVersion(['release'])).toBe(null);
  expect(helpText()).toContain('tagit <command>');
});

test('provides complete self-contained operator guidance', () => {
  expect(preflightGuide()).toContain('npm pack --dry-run');
  expect(preflightGuide()).toContain('Ubuntu and Windows');
  expect(releaseGuide()).toContain('tagit release --version X.Y.Z');
  expect(releaseGuide()).toContain('publish jobs individually');
});

test('detects CLI', () => {
  expect(isCli(['node', '/opt/tagit/bin/tagit.mjs'])).toBe(true);
  expect(isCli(['node', '/opt/test.mjs'])).toBe(false);
  expect(isCli(['node'])).toBe(false);
  expect(isHelp(['preflight', '--help'])).toBe(true);
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
  const updateVersionFiles = jest.fn().mockResolvedValue('2.4.0');
  const gitOperations = jest.fn();
  await runTagit({ updateVersionFiles, gitOperations, verifyRelease: noop, runPreflight: noop, suggestVersion: noop, log, registerHandlersFn: noop, registerSignalsFn: noop }, ['release', '--version', '2.4.0']);
  expect(updateVersionFiles).toHaveBeenCalledWith(expect.anything(), log, { targetVersion: '2.4.0' });
  expect(gitOperations).toHaveBeenCalledWith(expect.any(Function), expect.anything(), log, '2.4.0');
});

test('release rejects a missing version and handles release failures', async () => {
  const exit = jest.fn();
  const error = jest.fn();
  await runTagit({ exit, log: { ...log, error }, suggestVersion: noop, registerHandlersFn: noop, registerSignalsFn: noop }, ['release']);
  expect(exit).toHaveBeenCalledWith(1);
  const failed = jest.fn().mockRejectedValue(new Error('failed'));
  await runTagit({ exit, log: { ...log, error }, updateVersionFiles: failed, runPreflight: noop, suggestVersion: noop, registerHandlersFn: noop, registerSignalsFn: noop }, ['release', '--version', '2.4.0']);
  expect(exit).toHaveBeenCalledWith(1);
});

test('bare invocation displays help', async () => {
  const output = jest.fn();
  await runTagit({ output }, []);
  expect(output).toHaveBeenCalledWith(expect.stringContaining('tagit <command>'));
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await runTagit({}, []);
  expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('tagit <command>'));
  consoleSpy.mockRestore();
});

test('notag exits before release', async () => {
  const exit = jest.fn();
  const updateVersionFiles = jest.fn();
  const runPreflight = jest.fn(() => ({ test: { passed: true } }));
  await runTagit({ fs: { existsSync: jest.fn(() => true) }, exit, updateVersionFiles, runPreflight, suggestVersion: noop, log, registerHandlersFn: noop, registerSignalsFn: noop }, ['release', '--version', '2.4.0']);
  expect(runPreflight).toHaveBeenCalled();
  expect(exit).not.toHaveBeenCalled();
  expect(updateVersionFiles).not.toHaveBeenCalled();
});
