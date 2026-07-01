import { jest } from '@jest/globals';
import { gitOperations } from '../src/gitOperations.mjs';

describe('gitOperations', () => {
  let execSyncMock;
  let fsMock;
  let logMock;
  const mockVersion = '1.0.42';
  const dateFormatted = new Date().toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'}).replace(/\//g, '-');

  beforeEach(() => {
    execSyncMock = jest.fn();
    fsMock = {
      existsSync: jest.fn(),
      readFileSync: jest.fn()
    };
    logMock = {
      info: jest.fn(),
      error: jest.fn()
    };
  });

  test('runs all git and composer/npm commands when files exist', () => {
    fsMock.existsSync.mockReturnValue(true);
    fsMock.readFileSync.mockReturnValue(JSON.stringify({
      scripts: { build: 'webpack', webpack: 'webpack' },
      dependencies: { webpack: '^5.0.0' }
    }));

    gitOperations(execSyncMock, fsMock, logMock, mockVersion);

    expect(logMock.info).toHaveBeenCalledWith('Starting git operations');
    expect(logMock.info).toHaveBeenCalledWith('composer.json exists - running composer upgrade');
    expect(execSyncMock).toHaveBeenCalledWith('COMPOSER_HOME="." COMPOSER_ALLOW_SUPERUSER=1 composer upgrade', { stdio: 'inherit' });
    expect(logMock.info).toHaveBeenCalledWith('Running composer bump');
    expect(execSyncMock).toHaveBeenCalledWith('COMPOSER_HOME="." COMPOSER_ALLOW_SUPERUSER=1 composer bump', { stdio: 'inherit' });
    expect(logMock.info).toHaveBeenCalledWith('package.json exists - running npm upgrade');
    expect(execSyncMock).toHaveBeenCalledWith('npm upgrade', { stdio: 'inherit' });
    expect(logMock.info).toHaveBeenCalledWith('webpack detected - running webpack build');
    expect(execSyncMock).toHaveBeenCalledWith('npm run build', { stdio: 'inherit' });
    expect(logMock.info).toHaveBeenCalledWith('webpack build complete');
    expect(logMock.info).toHaveBeenCalledWith('Adding all changes to git');
    expect(execSyncMock).toHaveBeenCalledWith('git add -A', { stdio: 'inherit' });
    expect(logMock.info).toHaveBeenCalledWith(`Committing with message: Version ${mockVersion} - ${dateFormatted}`);
    expect(execSyncMock).toHaveBeenCalledWith(`git commit -m 'Version ${mockVersion} - ${dateFormatted}'`, { stdio: 'inherit' });
    expect(logMock.info).toHaveBeenCalledWith(`Tagging commit with tag: ${mockVersion}`);
    expect(execSyncMock).toHaveBeenCalledWith(`git tag ${mockVersion}`, { stdio: 'inherit' });
    expect(logMock.info).toHaveBeenCalledWith('Pushing commits to origin');
    expect(execSyncMock).toHaveBeenCalledWith('git push', { stdio: 'inherit' });
    expect(logMock.info).toHaveBeenCalledWith('Pushing tags to origin');
    expect(execSyncMock).toHaveBeenCalledWith('git push --tags', { stdio: 'inherit' });
    expect(logMock.info).toHaveBeenCalledWith('Git operations complete');
  });

  test('skips commands if files do not exist', () => {
    fsMock.existsSync.mockReturnValue(false);

    gitOperations(execSyncMock, fsMock, logMock, mockVersion);

    expect(logMock.info).toHaveBeenCalledWith('Starting git operations');
    expect(execSyncMock).toHaveBeenCalledWith('git add -A', { stdio: 'inherit' });
    expect(logMock.info).toHaveBeenCalledWith(`Committing with message: Version ${mockVersion} - ${dateFormatted}`);
    expect(execSyncMock).toHaveBeenCalledWith(`git commit -m 'Version ${mockVersion} - ${dateFormatted}'`, { stdio: 'inherit' });
    expect(logMock.info).toHaveBeenCalledWith(`Tagging commit with tag: ${mockVersion}`);
    expect(execSyncMock).toHaveBeenCalledWith(`git tag ${mockVersion}`, { stdio: 'inherit' });
    expect(logMock.info).toHaveBeenCalledWith('Pushing commits to origin');
    expect(execSyncMock).toHaveBeenCalledWith('git push', { stdio: 'inherit' });
    expect(logMock.info).toHaveBeenCalledWith('Pushing tags to origin');
    expect(execSyncMock).toHaveBeenCalledWith('git push --tags', { stdio: 'inherit' });
  });

  test('skips webpack build when package.json does not use webpack', () => {
    fsMock.existsSync.mockImplementation((file) => file === 'composer.json' || file === 'package.json');
    fsMock.readFileSync.mockReturnValue(JSON.stringify({
      scripts: { build: 'vite build' },
      dependencies: {}
    }));

    gitOperations(execSyncMock, fsMock, logMock, mockVersion);

    expect(execSyncMock).toHaveBeenCalledWith('npm upgrade', { stdio: 'inherit' });
    expect(execSyncMock).not.toHaveBeenCalledWith('npm run webpack', { stdio: 'inherit' });
    expect(execSyncMock).not.toHaveBeenCalledWith('npx webpack', { stdio: 'inherit' });
  });

  test('runs webpack build when webpack.config.js exists', () => {
    fsMock.existsSync.mockImplementation((file) => file === 'package.json' || file === 'webpack.config.js');
    fsMock.readFileSync.mockReturnValue(JSON.stringify({
      scripts: {},
      dependencies: {}
    }));

    gitOperations(execSyncMock, fsMock, logMock, mockVersion);

    expect(logMock.info).toHaveBeenCalledWith('webpack detected - running webpack build');
    expect(execSyncMock).toHaveBeenCalledWith('npx webpack', { stdio: 'inherit' });
    expect(logMock.info).toHaveBeenCalledWith('webpack build complete');
  });

  test('prefers npm run build over webpack script when both exist', () => {
    fsMock.existsSync.mockImplementation((file) => file === 'package.json' || file === 'webpack.config.mjs');
    fsMock.readFileSync.mockReturnValue(JSON.stringify({
      scripts: { build: 'webpack', webpack: 'webpack --mode production' },
      dependencies: {}
    }));

    gitOperations(execSyncMock, fsMock, logMock, mockVersion);

    expect(execSyncMock).toHaveBeenCalledWith('npm run build', { stdio: 'inherit' });
    expect(execSyncMock).not.toHaveBeenCalledWith('npm run webpack', { stdio: 'inherit' });
    expect(execSyncMock).not.toHaveBeenCalledWith('npx webpack', { stdio: 'inherit' });
  });
});
