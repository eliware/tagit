import { jest } from '@jest/globals';
import {
  getBumpVersion, getVersion, helpText, isCli, isDryRun, isHelp, isVersion, isYes, parseOptions, runTagit
} from '../bin/tagit.mjs';

const makeLog = () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() });
const makeFs = (existsSync = jest.fn(() => false)) => ({ existsSync });
const noop = jest.fn();

test('detects CLI execution', () => {
  expect(isCli(['node', '/opt/tagit/bin/tagit.mjs'])).toBe(true);
  expect(isCli(['node', '/usr/local/bin/tagit'])).toBe(true);
  expect(isCli(['node', '/opt/test.mjs'])).toBe(false);
  expect(isCli(['node'])).toBe(false);
});

test('detects supported options and renders help', () => {
  expect(isHelp(['node', 'tagit', '--help'])).toBe(true);
  expect(isHelp(['node', 'tagit', '-h'])).toBe(true);
  expect(isDryRun(['node', 'tagit', '--dry-run'])).toBe(true);
  expect(isYes(['node', 'tagit', '-y'])).toBe(true);
  expect(getBumpVersion(['node', 'tagit', '-b', '2.4.0'])).toBe('2.4.0');
  expect(isVersion(['node', 'tagit', '--version'])).toBe(true);
  expect(isVersion(['node', 'tagit', '-v'])).toBe(true);
  expect(isVersion(['node', 'tagit'])).toBe(false);
  expect(isHelp(['node', 'tagit'])).toBe(false);
  expect(isDryRun(['node', 'tagit'])).toBe(false);
  expect(isYes(['node', 'tagit'])).toBe(false);
  expect(getBumpVersion(['node', 'tagit'])).toBe(null);
  expect(getBumpVersion(['node', 'tagit', '-b'])).toBe(null);
  expect(getBumpVersion(['node', 'tagit', '-b', '--dry-run'])).toBe(null);
  expect(helpText()).toContain('--dry-run');
});

test('reads the installed version', () => {
  const fs = { readFileSync: jest.fn(() => JSON.stringify({ version: '9.8.7' })) };

  expect(getVersion(fs)).toBe('9.8.7');
  expect(fs.readFileSync).toHaveBeenCalledWith(expect.any(URL), 'utf8');
  expect(getVersion()).toMatch(/^\d+\.\d+\.\d+$/);
});

test('rejects invalid explicit versions', () => {
  expect(() => getBumpVersion(['node', 'tagit', '--bump', 'next'])).toThrow('Invalid bump version: next');
  expect(parseOptions(['--bump', '3.2.1']).bumpVersion).toBe('3.2.1');
});

test('uses default CLI dependencies for bare invocation', async () => {
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

  await runTagit();

  expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Usage: tagit'));
  consoleSpy.mockRestore();
});

test('passes explicit bump version through release and dry-run flows', async () => {
  const log = makeLog();
  const fs = makeFs();
  const updateVersionFiles = jest.fn().mockResolvedValue('2.4.0');
  const gitOperations = jest.fn();

  await runTagit({ fs, log, updateVersionFiles, gitOperations, registerHandlersFn: noop, registerSignalsFn: noop }, ['-y', '-b', '2.4.0']);
  await runTagit({ fs, log, updateVersionFiles, gitOperations, registerHandlersFn: noop, registerSignalsFn: noop }, ['--dry-run', '--bump', '2.4.0']);

  expect(updateVersionFiles).toHaveBeenNthCalledWith(1, fs, log, { targetVersion: '2.4.0' });
  expect(updateVersionFiles).toHaveBeenNthCalledWith(2, fs, log, { dryRun: true, targetVersion: '2.4.0' });
});

afterEach(() => jest.clearAllMocks());

test('runs release flow', async () => {
  const log = makeLog();
  const fs = makeFs();
  const updateVersionFiles = jest.fn().mockResolvedValue('1.2.4');
  const gitOperations = jest.fn();

  await runTagit({ fs, log, updateVersionFiles, gitOperations, registerHandlersFn: noop, registerSignalsFn: noop }, ['-y']);

  expect(noop).toHaveBeenCalledTimes(2);
  expect(updateVersionFiles).toHaveBeenCalledWith(fs, log);
  expect(gitOperations).toHaveBeenCalledWith(expect.any(Function), fs, log, '1.2.4');
  expect(log.info).toHaveBeenCalledWith('Updated version to 1.2.4');
});

test('runs dry-run flow without release writes', async () => {
  const log = makeLog();
  const fs = makeFs();
  const updateVersionFiles = jest.fn().mockResolvedValue('1.2.4');
  const gitOperations = jest.fn();

  await runTagit({ fs, log, updateVersionFiles, gitOperations, registerHandlersFn: noop, registerSignalsFn: noop }, ['--dry-run']);

  expect(updateVersionFiles).toHaveBeenCalledWith(fs, log, { dryRun: true });
  expect(gitOperations).toHaveBeenCalledWith(expect.any(Function), fs, log, '1.2.4', { dryRun: true });
  expect(log.info).toHaveBeenCalledWith('Dry run: would update version to 1.2.4');
});

test('bare command displays help without release checks', async () => {
  const output = jest.fn();
  const updateVersionFiles = jest.fn();

  await runTagit({ output, updateVersionFiles }, []);

  expect(output).toHaveBeenCalledWith(expect.stringContaining('A bare tagit command displays this help.'));
  expect(updateVersionFiles).not.toHaveBeenCalled();
});

test('help exits without release checks', async () => {
  const output = jest.fn();
  const updateVersionFiles = jest.fn();

  await runTagit({ output, updateVersionFiles }, ['--help']);

  expect(output).toHaveBeenCalledWith(expect.stringContaining('Usage: tagit'));
  expect(updateVersionFiles).not.toHaveBeenCalled();
});

test('requires yes for a real release', async () => {
  const output = jest.fn();
  const updateVersionFiles = jest.fn();

  await runTagit({ output, updateVersionFiles }, ['--dry-run', '--help']);

  expect(output).toHaveBeenCalledWith(expect.stringContaining('Usage: tagit'));
  expect(updateVersionFiles).not.toHaveBeenCalled();
});

test('aborts when .notag exists', async () => {
  const log = makeLog();
  const exit = jest.fn();
  const fs = makeFs(jest.fn(() => true));
  const updateVersionFiles = jest.fn();

  await runTagit({ fs, log, exit, updateVersionFiles, registerHandlersFn: noop, registerSignalsFn: noop }, ['-y']);

  expect(log.warn).toHaveBeenCalled();
  expect(exit).toHaveBeenCalledWith(0);
  expect(updateVersionFiles).not.toHaveBeenCalled();
});

test('exits when .notag check fails', async () => {
  const log = makeLog();
  const exit = jest.fn();
  const fs = makeFs(jest.fn(() => { throw new Error('fs failed'); }));

  await runTagit({ fs, log, exit, registerHandlersFn: noop, registerSignalsFn: noop }, ['-y']);

  expect(log.error).toHaveBeenCalledWith('Error checking for .notag file:', expect.any(Error));
  expect(exit).toHaveBeenCalledWith(1);
});

test('exits when release fails', async () => {
  const log = makeLog();
  const exit = jest.fn();
  const updateVersionFiles = jest.fn().mockRejectedValue(new Error('release failed'));

  await runTagit({ log, exit, updateVersionFiles, registerHandlersFn: noop, registerSignalsFn: noop }, ['-y']);

  expect(log.error).toHaveBeenCalledWith(expect.any(Error));
  expect(exit).toHaveBeenCalledWith(1);
});
