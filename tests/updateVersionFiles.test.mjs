import { jest } from '@jest/globals';
import { updateVersionFiles } from '../src/updateVersionFiles.mjs';

describe('updateVersionFiles', () => {
  let fsMock;
  let logMock;

  beforeEach(() => {
    fsMock = {
      existsSync: jest.fn(),
      readFileSync: jest.fn(),
      writeFileSync: jest.fn()
    };
    logMock = {
      info: jest.fn(),
      error: jest.fn()
    };
  });

  test('throws error if composer.json has no version', async () => {
    fsMock.existsSync.mockImplementation((file) => file === 'composer.json');
    fsMock.readFileSync.mockReturnValueOnce(JSON.stringify({}));

    await expect(updateVersionFiles(fsMock, logMock)).rejects.toThrow('Version not found in composer.json.');
  });

  test('throws error if package.json has no version', async () => {
    fsMock.existsSync.mockImplementation((file) => file === 'package.json');
    fsMock.readFileSync.mockReturnValueOnce(JSON.stringify({}));

    // Skip composer.json
    fsMock.existsSync.mockReturnValueOnce(false);

    await expect(updateVersionFiles(fsMock, logMock)).rejects.toThrow('Version not found in package.json.');
  });

  test('increments version in composer.json', async () => {
    fsMock.existsSync.mockImplementation(file => file === 'composer.json');
    fsMock.readFileSync.mockImplementation(file => {
      if (file === 'composer.json') {
        return JSON.stringify({ version: '1.0.0' });
      }
      throw new Error(`Unexpected readFileSync call for ${file}`);
    });

    const newVersion = await updateVersionFiles(fsMock, logMock);

    expect(newVersion).toBe('1.0.1');

    const callArgs = fsMock.writeFileSync.mock.calls.find(([file]) => file === 'composer.json');
    expect(callArgs).toBeDefined();
    const writtenContent = callArgs[1];
    const data = JSON.parse(writtenContent);
    expect(data.version).toBe('1.0.1');

    expect(logMock.info).toHaveBeenCalled();
  });

  test('syncs package.json to the composer version', async () => {
    fsMock.existsSync.mockImplementation(file => file === 'composer.json' || file === 'package.json');
    fsMock.readFileSync.mockImplementation(file => JSON.stringify({
      version: file === 'composer.json' ? '1.0.0' : '0.9.9'
    }));

    const newVersion = await updateVersionFiles(fsMock, logMock);

    expect(newVersion).toBe('1.0.1');
    const packageWrite = fsMock.writeFileSync.mock.calls.find(([file]) => file === 'package.json');
    expect(JSON.parse(packageWrite[1]).version).toBe('1.0.1');
    expect(logMock.info).toHaveBeenCalledWith('Syncing package.json version to 1.0.1');
  });

  test('increments version in package.json if composer.json missing', async () => {
    fsMock.existsSync.mockImplementation(file => file === 'package.json');
    fsMock.readFileSync.mockReturnValueOnce(JSON.stringify({ version: '2.1.3' }));

    const newVersion = await updateVersionFiles(fsMock, logMock);

    expect(newVersion).toBe('2.1.4');

    const callArgs = fsMock.writeFileSync.mock.calls.find(([file]) => file === 'package.json');
    expect(callArgs).toBeDefined();
    const writtenContent = callArgs[1];
    const data = JSON.parse(writtenContent);
    expect(data.version).toBe('2.1.4');

    expect(logMock.info).toHaveBeenCalled();
  });

  test('dry-run calculates without writing version files', async () => {
    fsMock.existsSync.mockImplementation(file => file === 'package.json');
    fsMock.readFileSync.mockReturnValue(JSON.stringify({ version: '2.1.3' }));

    const newVersion = await updateVersionFiles(fsMock, logMock, { dryRun: true });

    expect(newVersion).toBe('2.1.4');
    expect(fsMock.writeFileSync).not.toHaveBeenCalled();
    expect(logMock.info).toHaveBeenCalledWith('Dry run: would write updated version to package.json');
  });

  test('dry-run leaves composer version unwritten', async () => {
    fsMock.existsSync.mockImplementation(file => file === 'composer.json');
    fsMock.readFileSync.mockReturnValue(JSON.stringify({ version: '1.0.0' }));

    await updateVersionFiles(fsMock, logMock, { dryRun: true });

    expect(fsMock.writeFileSync).not.toHaveBeenCalled();
    expect(logMock.info).toHaveBeenCalledWith('Dry run: would write updated version to composer.json');
  });

  test('uses an explicit target version for all version files', async () => {
    fsMock.existsSync.mockImplementation(file => file === 'composer.json' || file === 'package.json');
    fsMock.readFileSync.mockImplementation(file => JSON.stringify({ version: file === 'composer.json' ? '1.0.0' : '0.9.9' }));

    const newVersion = await updateVersionFiles(fsMock, logMock, { targetVersion: '7.8.9' });

    expect(newVersion).toBe('7.8.9');
    expect(fsMock.writeFileSync).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fsMock.writeFileSync.mock.calls[1][1]).version).toBe('7.8.9');
  });

  test('rejects an invalid explicit target version', async () => {
    await expect(updateVersionFiles(fsMock, logMock, { targetVersion: 'not-a-version' }))
      .rejects.toThrow('Invalid target version');
  });

});
