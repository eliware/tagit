import { jest } from '@jest/globals';
import { isCli, runTagit } from '../tagit.mjs';

const makeLog = () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() });
const makeFs = (existsSync = jest.fn(() => false)) => ({ existsSync });
const noop = jest.fn();

test('detects CLI execution', () => {
  expect(isCli(['node', '/opt/tagit/tagit.mjs'])).toBe(true);
  expect(isCli(['node', '/opt/test.mjs'])).toBe(false);
  expect(isCli(['node'])).toBe(false);
});

afterEach(() => jest.clearAllMocks());

test('runs release flow', async () => {
  const log = makeLog();
  const fs = makeFs();
  const updateVersionFiles = jest.fn().mockResolvedValue('1.2.4');
  const gitOperations = jest.fn();

  await runTagit({ fs, log, updateVersionFiles, gitOperations, registerHandlersFn: noop, registerSignalsFn: noop });

  expect(noop).toHaveBeenCalledTimes(2);
  expect(updateVersionFiles).toHaveBeenCalledWith(fs, log);
  expect(gitOperations).toHaveBeenCalledWith(expect.any(Function), fs, log, '1.2.4');
  expect(log.info).toHaveBeenCalledWith('Updated version to 1.2.4');
});

test('aborts when .notag exists', async () => {
  const log = makeLog();
  const exit = jest.fn();
  const fs = makeFs(jest.fn(() => true));
  const updateVersionFiles = jest.fn();

  await runTagit({ fs, log, exit, updateVersionFiles, registerHandlersFn: noop, registerSignalsFn: noop });

  expect(log.warn).toHaveBeenCalled();
  expect(exit).toHaveBeenCalledWith(0);
  expect(updateVersionFiles).not.toHaveBeenCalled();
});

test('exits when .notag check fails', async () => {
  const log = makeLog();
  const exit = jest.fn();
  const fs = makeFs(jest.fn(() => { throw new Error('fs failed'); }));

  await runTagit({ fs, log, exit, registerHandlersFn: noop, registerSignalsFn: noop });

  expect(log.error).toHaveBeenCalledWith('Error checking for .notag file:', expect.any(Error));
  expect(exit).toHaveBeenCalledWith(1);
});

test('exits when release fails', async () => {
  const log = makeLog();
  const exit = jest.fn();
  const updateVersionFiles = jest.fn().mockRejectedValue(new Error('release failed'));

  await runTagit({ log, exit, updateVersionFiles, registerHandlersFn: noop, registerSignalsFn: noop });

  expect(log.error).toHaveBeenCalledWith(expect.any(Error));
  expect(exit).toHaveBeenCalledWith(1);
});
