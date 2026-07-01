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
      readFileSync: jest.fn(),
      writeFileSync: jest.fn()
    };
    logMock = {
      info: jest.fn(),
      error: jest.fn()
    };
  });

  test('runs all git and composer/npm commands when files exist', () => {
    fsMock.existsSync.mockReturnValue(true);
    fsMock.readFileSync.mockReturnValue(JSON.stringify({
      scripts: { test: 'jest', build: 'webpack', webpack: 'webpack' },
      dependencies: { webpack: '^5.0.0' }
    }));

    gitOperations(execSyncMock, fsMock, logMock, mockVersion);

    expect(logMock.info).toHaveBeenCalledWith('Starting git operations');
    expect(logMock.info).toHaveBeenCalledWith('composer.json exists - running composer update');
    expect(execSyncMock).toHaveBeenCalledWith('COMPOSER_HOME="." COMPOSER_ALLOW_SUPERUSER=1 composer update', { stdio: 'inherit' });
    expect(logMock.info).toHaveBeenCalledWith('Running composer bump');
    expect(execSyncMock).toHaveBeenCalledWith('COMPOSER_HOME="." COMPOSER_ALLOW_SUPERUSER=1 composer bump', { stdio: 'inherit' });
    expect(logMock.info).toHaveBeenCalledWith('package.json exists - running npm update');
    expect(execSyncMock).toHaveBeenCalledWith('npm update', { stdio: 'inherit' });
    expect(logMock.info).toHaveBeenCalledWith('package.json has test script - running npm test');
    expect(execSyncMock).toHaveBeenCalledWith('npm test', { stdio: 'inherit' });
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

    expect(execSyncMock).toHaveBeenCalledWith('npm update', { stdio: 'inherit' });
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

  test('restores version files if npm update fails', () => {
    fsMock.existsSync.mockImplementation((file) => file === 'composer.json' || file === 'package.json');
    fsMock.readFileSync.mockImplementation((file) => {
      if (file === 'composer.json') {
        return JSON.stringify({ version: '1.0.41' });
      }

      return JSON.stringify({ version: '1.0.41', scripts: {} });
    });
    execSyncMock.mockImplementation((command) => {
      if (command === 'npm update') {
        throw new Error('npm failed');
      }
    });

    expect(() => gitOperations(execSyncMock, fsMock, logMock, mockVersion)).toThrow('npm failed');

    expect(fsMock.writeFileSync).toHaveBeenCalledWith('composer.json', JSON.stringify({ version: '1.0.41' }), 'utf-8');
    expect(fsMock.writeFileSync).toHaveBeenCalledWith('package.json', JSON.stringify({ version: '1.0.41', scripts: {} }), 'utf-8');
    expect(execSyncMock).toHaveBeenCalledWith('npm update', { stdio: 'inherit' });
    expect(execSyncMock).not.toHaveBeenCalledWith('git add -A', { stdio: 'inherit' });
  });

  test('runs npm test before build when defined', () => {
    fsMock.existsSync.mockImplementation((file) => file === 'package.json');
    fsMock.readFileSync.mockReturnValue(JSON.stringify({
      scripts: { test: 'jest', build: 'webpack' },
      dependencies: { webpack: '^5.0.0' }
    }));

    gitOperations(execSyncMock, fsMock, logMock, mockVersion);

    expect(execSyncMock).toHaveBeenCalledWith('npm update', { stdio: 'inherit' });
    expect(execSyncMock).toHaveBeenCalledWith('npm test', { stdio: 'inherit' });
    expect(execSyncMock).toHaveBeenCalledWith('npm run build', { stdio: 'inherit' });
  });

  test('restores version files if npm test fails', () => {
    fsMock.existsSync.mockImplementation((file) => file === 'package.json');
    fsMock.readFileSync.mockReturnValue(JSON.stringify({
      version: '1.0.41',
      scripts: { test: 'jest', build: 'webpack' },
      dependencies: { webpack: '^5.0.0' }
    }));
    execSyncMock.mockImplementation((command) => {
      if (command === 'npm test') {
        throw new Error('tests failed');
      }
    });

    expect(() => gitOperations(execSyncMock, fsMock, logMock, mockVersion)).toThrow('tests failed');

    expect(fsMock.writeFileSync).toHaveBeenCalledWith('package.json', JSON.stringify({
      version: '1.0.41',
      scripts: { test: 'jest', build: 'webpack' },
      dependencies: { webpack: '^5.0.0' }
    }), 'utf-8');
  });

  test('restores version files if build fails', () => {
    fsMock.existsSync.mockImplementation((file) => file === 'package.json');
    fsMock.readFileSync.mockReturnValue(JSON.stringify({
      version: '1.0.41',
      scripts: { build: 'webpack' },
      dependencies: { webpack: '^5.0.0' }
    }));
    execSyncMock.mockImplementation((command) => {
      if (command === 'npm run build') {
        throw new Error('build failed');
      }
    });

    expect(() => gitOperations(execSyncMock, fsMock, logMock, mockVersion)).toThrow('build failed');
    expect(fsMock.writeFileSync).toHaveBeenCalledWith('package.json', JSON.stringify({
      version: '1.0.41',
      scripts: { build: 'webpack' },
      dependencies: { webpack: '^5.0.0' }
    }), 'utf-8');
  });
});
