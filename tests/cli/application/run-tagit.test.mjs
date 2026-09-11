import { jest } from '@jest/globals';
import { execFileSync } from 'node:child_process';
import { isCli, runTagit } from '../../../src/cli/application/run-tagit.mjs';
import packageData from '../../../package.json' with { type: 'json' };

const noop = jest.fn();
const log = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
const testArgv = process.argv;
beforeAll(() => {
  process.argv = ['node', 'tagit'];
});
afterAll(() => {
  process.argv = testArgv;
});

test('runs the public CLI help entry point from the repository root', () => {
  const output = execFileSync(process.execPath, ['bin/tagit-cli.mjs', '--help'], { encoding: 'utf8' });
  expect(output).toContain('Usage: tagit');
});
test('runs the notes entry point with injected dependencies', async () => {
  const output = jest.fn();
  await runTagit(
    {
      output,
      buildNotesReport: jest.fn(() => 'TAGIT NOTES REPORT'),
      suggestVersion: noop,
      log,
      registerHandlersFn: noop,
      registerSignalsFn: noop,
    },
    ['notes'],
  );
  expect(output).toHaveBeenCalledWith('TAGIT NOTES REPORT');
});
test('handles CLI help, version, and parse-error boundaries', async () => {
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
  await runTagit(
    {
      runPreflight: jest.fn(() => ({ test: { passed: true } })),
      suggestVersion: noop,
      log,
      registerHandlersFn: noop,
      registerSignalsFn: noop,
    },
    ['preflight'],
  );
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
  await runTagit(
    {
      output,
      runPreflight,
      updateVersionFiles,
      suggestVersion: noop,
      log,
      registerHandlersFn: noop,
      registerSignalsFn: noop,
    },
    ['preflight'],
  );
  expect(runPreflight).toHaveBeenCalled();
  expect(updateVersionFiles).not.toHaveBeenCalled();
  expect(output).toHaveBeenCalledWith(JSON.stringify({ ok: true, checks: { test: { passed: true } } }));
});
test('passes the explicit coverage waiver to preflight', async () => {
  const runPreflight = jest.fn(() => ({ test: { passed: true } }));
  await runTagit({ output: jest.fn(), runPreflight, log, registerHandlersFn: noop, registerSignalsFn: noop }, [
    'preflight',
    '--ignore-100x4',
  ]);
  expect(runPreflight).toHaveBeenCalledWith(
    expect.anything(),
    expect.anything(),
    log,
    expect.objectContaining({ ignore100x4: true }),
  );
});
test('notes prints the generated report without release side effects', async () => {
  const output = jest.fn();
  const buildNotesReport = jest.fn(() => 'TAGIT NOTES REPORT');
  const gitOperations = jest.fn();
  await runTagit(
    {
      output,
      buildNotesReport,
      gitOperations,
      suggestVersion: noop,
      log,
      registerHandlersFn: noop,
      registerSignalsFn: noop,
    },
    ['notes'],
  );
  expect(buildNotesReport).toHaveBeenCalledWith(expect.anything(), expect.anything());
  expect(gitOperations).not.toHaveBeenCalled();
  expect(output).toHaveBeenCalledWith('TAGIT NOTES REPORT');
});
test('notes uses console output when no output override is supplied', async () => {
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await runTagit(
    {
      buildNotesReport: jest.fn(() => 'report'),
      suggestVersion: noop,
      log,
      registerHandlersFn: noop,
      registerSignalsFn: noop,
    },
    ['notes'],
  );
  expect(consoleSpy).toHaveBeenCalledWith('report');
  consoleSpy.mockRestore();
});
test('preserves failure after the exit boundary is stubbed', async () => {
  const realExit = process.exit;
  process.exit = jest.fn();
  try {
    await expect(runTagit({ log }, ['unknown-command'])).rejects.toThrow();
  } finally {
    process.exit = realExit;
  }
});

test('uses default dependencies and argv at the public boundary', async () => {
  await runTagit();
});
