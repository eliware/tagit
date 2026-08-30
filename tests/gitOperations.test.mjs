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
      warn: jest.fn(),
      error: jest.fn()
    };
  });

  test('dry-run runs package checks without release operations', () => {
    fsMock.existsSync.mockImplementation((file) => file === 'package.json' || file === 'webpack.config.js');
    fsMock.readFileSync.mockReturnValue(JSON.stringify({
      scripts: { test: 'jest' },
      dependencies: {}
    }));

    gitOperations(execSyncMock, fsMock, logMock, mockVersion, { dryRun: true });

    expect(execSyncMock).toHaveBeenCalledWith('npm test', { stdio: 'inherit' });
    expect(execSyncMock).toHaveBeenCalledWith('npx webpack', { stdio: 'inherit' });
    expect(execSyncMock).not.toHaveBeenCalledWith('git add -A', { stdio: 'inherit' });
    expect(logMock.info).toHaveBeenCalledWith(`Dry run complete: ${mockVersion} was not released`);
  });

  test('dry-run skips checks when package.json is absent', () => {
    fsMock.existsSync.mockReturnValue(false);

    gitOperations(execSyncMock, fsMock, logMock, mockVersion, { dryRun: true });

    expect(execSyncMock).not.toHaveBeenCalled();
    expect(logMock.info).toHaveBeenCalledWith(`Dry run complete: ${mockVersion} was not released`);
  });

  test('dry-run skips npm test when no test script exists', () => {
    fsMock.existsSync.mockImplementation((file) => file === 'package.json');
    fsMock.readFileSync.mockReturnValue(JSON.stringify({ scripts: {}, dependencies: {} }));

    gitOperations(execSyncMock, fsMock, logMock, mockVersion, { dryRun: true });

    expect(execSyncMock).not.toHaveBeenCalledWith('npm test', { stdio: 'inherit' });
  });

  test('continues when npm outdated has no output', () => {
    fsMock.existsSync.mockImplementation((file) => file === 'package.json');
    fsMock.readFileSync.mockReturnValue(JSON.stringify({ scripts: {}, dependencies: {} }));
    execSyncMock.mockImplementation((command) => command === 'npm outdated --json' ? '' : undefined);

    gitOperations(execSyncMock, fsMock, logMock, mockVersion);

    expect(logMock.warn).not.toHaveBeenCalled();
  });

  test('returns the pushed commit SHA', () => {
    fsMock.existsSync.mockReturnValue(false);
    execSyncMock.mockImplementation((command) => command === 'git rev-parse HEAD' ? 'abc123\n' : undefined);
    expect(gitOperations(execSyncMock, fsMock, logMock, mockVersion)).toEqual({ commitSha: 'abc123', tag: `v${mockVersion}` });
  });

  test('continues when npm outdated output is invalid', () => {
    fsMock.existsSync.mockImplementation((file) => file === 'package.json');
    fsMock.readFileSync.mockReturnValue(JSON.stringify({ scripts: {}, dependencies: {} }));
    execSyncMock.mockImplementation((command) => command === 'npm outdated --json' ? '{bad json' : undefined);

    gitOperations(execSyncMock, fsMock, logMock, mockVersion);

    expect(logMock.warn).toHaveBeenCalledWith('Unable to parse npm outdated output; continuing without latest upgrades');
  });

  test('uses npm outdated error stdout and upgrades listed dependencies', () => {
    fsMock.existsSync.mockImplementation((file) => file === 'package.json');
    fsMock.readFileSync.mockReturnValue(JSON.stringify({ scripts: {}, dependencies: {} }));
    execSyncMock.mockImplementation((command) => {
      if (command === 'npm outdated --json') throw { stdout: JSON.stringify({ lodash: {} }) };
    });

    gitOperations(execSyncMock, fsMock, logMock, mockVersion);

    expect(execSyncMock).toHaveBeenCalledWith('npm install lodash@latest', { stdio: 'inherit' });
  });

  test('ignores npm outdated failures without stdout', () => {
    fsMock.existsSync.mockImplementation((file) => file === 'package.json');
    fsMock.readFileSync.mockReturnValue(JSON.stringify({ scripts: {}, dependencies: {} }));
    execSyncMock.mockImplementation((command) => {
      if (command === 'npm outdated --json') throw new Error('outdated unavailable');
    });

    gitOperations(execSyncMock, fsMock, logMock, mockVersion);

    expect(logMock.warn).not.toHaveBeenCalled();
  });

  test('does not restore absent version snapshots on failure', () => {
    fsMock.existsSync.mockReturnValue(false);
    execSyncMock.mockImplementation((command) => {
      if (command === 'git add -A') throw new Error('git failed');
    });

    expect(() => gitOperations(execSyncMock, fsMock, logMock, mockVersion)).toThrow('git failed');
    expect(fsMock.writeFileSync).not.toHaveBeenCalled();
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
    expect(logMock.info).toHaveBeenCalledWith('package.json exists - running npm install');
    expect(execSyncMock).toHaveBeenCalledWith('npm install', { stdio: 'inherit' });
    expect(execSyncMock).toHaveBeenCalledWith('npm outdated --json', { encoding: 'utf-8' });
    expect(logMock.info).toHaveBeenCalledWith('Running npm update');
    expect(execSyncMock).toHaveBeenCalledWith('npm install', { stdio: 'inherit' });
    expect(execSyncMock).toHaveBeenCalledWith('npm outdated --json', { encoding: 'utf-8' });
    expect(execSyncMock).toHaveBeenCalledWith('npm install', { stdio: 'inherit' });
    expect(execSyncMock).toHaveBeenCalledWith('npm outdated --json', { encoding: 'utf-8' });
    expect(execSyncMock).toHaveBeenCalledWith('npm update', { stdio: 'inherit' });
    expect(logMock.info).toHaveBeenCalledWith('package.json has test script - running npm test');
    expect(execSyncMock).toHaveBeenCalledWith('npm test', { stdio: 'inherit' });
    expect(logMock.info).toHaveBeenCalledWith('webpack detected - running webpack build');
    expect(execSyncMock).toHaveBeenCalledWith('npm run build', { stdio: 'inherit' });
    expect(logMock.info).toHaveBeenCalledWith('webpack build complete');
    expect(logMock.info).toHaveBeenCalledWith('Adding all changes to git');
    expect(execSyncMock).toHaveBeenCalledWith('git add -A', { stdio: 'inherit' });
    expect(logMock.info).toHaveBeenCalledWith(`Committing with message: Version ${mockVersion} - ${dateFormatted}`);
    expect(execSyncMock).toHaveBeenCalledWith(`git commit -m ${JSON.stringify(`Version ${mockVersion} - ${dateFormatted}`)}`, { stdio: 'inherit' });
    expect(logMock.info).toHaveBeenCalledWith(`Tagging commit with tag: v${mockVersion}`);
    expect(execSyncMock).toHaveBeenCalledWith(`git tag v${mockVersion}`, { stdio: 'inherit' });
    expect(logMock.info).toHaveBeenCalledWith('Pushing commits to origin');
    expect(execSyncMock).toHaveBeenCalledWith('git push', { stdio: 'inherit' });
    expect(logMock.info).toHaveBeenCalledWith('Pushing tags to origin');
    expect(execSyncMock).toHaveBeenCalledWith('git push --tags', { stdio: 'inherit' });
    expect(logMock.info).toHaveBeenCalledWith('Git operations complete');
  });

  test('reasserts the release version after npm rewrites package metadata', () => {
    fsMock.existsSync.mockImplementation((file) => file === 'package.json' || file === 'package-lock.json');
    let packageReads = 0;
    fsMock.readFileSync.mockImplementation((file) => {
      if (file === 'package.json') {
        packageReads += 1;
        return JSON.stringify({ version: packageReads === 1 ? '1.0.10' : '1.0.10', scripts: {}, dependencies: {} });
      }
      return JSON.stringify({ version: '1.0.10', packages: { '': { version: '1.0.10' } } });
    });

    gitOperations(execSyncMock, fsMock, logMock, mockVersion);

    expect(fsMock.writeFileSync).toHaveBeenCalledWith('package.json', expect.stringContaining('"version": "1.0.42"'), 'utf-8');
    expect(fsMock.writeFileSync).toHaveBeenCalledWith('package-lock.json', expect.stringContaining('"version": "1.0.42"'), 'utf-8');
  });

  test('leaves matching package metadata unchanged', () => {
    fsMock.existsSync.mockImplementation((file) => file === 'package.json' || file === 'package-lock.json');
    fsMock.readFileSync.mockImplementation((file) => file === 'package.json'
      ? JSON.stringify({ version: mockVersion, scripts: {}, dependencies: {} })
      : JSON.stringify({ version: mockVersion, packages: { '': { version: mockVersion } } }));

    gitOperations(execSyncMock, fsMock, logMock, mockVersion);

    expect(fsMock.writeFileSync).not.toHaveBeenCalled();
  });

  test('skips commands if files do not exist', () => {
    fsMock.existsSync.mockReturnValue(false);

    gitOperations(execSyncMock, fsMock, logMock, mockVersion);

    expect(logMock.info).toHaveBeenCalledWith('Starting git operations');
    expect(execSyncMock).toHaveBeenCalledWith('git add -A', { stdio: 'inherit' });
    expect(logMock.info).toHaveBeenCalledWith(`Committing with message: Version ${mockVersion} - ${dateFormatted}`);
    expect(execSyncMock).toHaveBeenCalledWith(`git commit -m ${JSON.stringify(`Version ${mockVersion} - ${dateFormatted}`)}`, { stdio: 'inherit' });
    expect(logMock.info).toHaveBeenCalledWith(`Tagging commit with tag: v${mockVersion}`);
    expect(execSyncMock).toHaveBeenCalledWith(`git tag v${mockVersion}`, { stdio: 'inherit' });
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

    expect(execSyncMock).toHaveBeenCalledWith('npm install', { stdio: 'inherit' });
    expect(execSyncMock).toHaveBeenCalledWith('npm outdated --json', { encoding: 'utf-8' });
    expect(execSyncMock).toHaveBeenCalledWith('npm install', { stdio: 'inherit' });
    expect(execSyncMock).toHaveBeenCalledWith('npm outdated --json', { encoding: 'utf-8' });
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

  test('runs npm run webpack when webpack script is the available build command', () => {
    fsMock.existsSync.mockImplementation((file) => file === 'package.json');
    fsMock.readFileSync.mockReturnValue(JSON.stringify({
      scripts: { webpack: 'webpack --mode production' },
      dependencies: { webpack: '^5.0.0' }
    }));

    gitOperations(execSyncMock, fsMock, logMock, mockVersion);

    expect(logMock.info).toHaveBeenCalledWith('webpack detected - running webpack build');
    expect(execSyncMock).toHaveBeenCalledWith('npm run webpack', { stdio: 'inherit' });
    expect(execSyncMock).not.toHaveBeenCalledWith('npx webpack', { stdio: 'inherit' });
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
    expect(execSyncMock).toHaveBeenCalledWith('npm install', { stdio: 'inherit' });
    expect(execSyncMock).toHaveBeenCalledWith('npm outdated --json', { encoding: 'utf-8' });
    expect(execSyncMock).toHaveBeenCalledWith('npm install', { stdio: 'inherit' });
    expect(execSyncMock).toHaveBeenCalledWith('npm outdated --json', { encoding: 'utf-8' });
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

    expect(execSyncMock).toHaveBeenCalledWith('npm install', { stdio: 'inherit' });
    expect(execSyncMock).toHaveBeenCalledWith('npm outdated --json', { encoding: 'utf-8' });
    expect(execSyncMock).toHaveBeenCalledWith('npm install', { stdio: 'inherit' });
    expect(execSyncMock).toHaveBeenCalledWith('npm outdated --json', { encoding: 'utf-8' });
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

test('uses argument arrays for release Git mutations when injected', () => {
  const execSync = jest.fn();
  const execFileSync = jest.fn((executable, args) => args[0] === 'rev-parse' ? 'abc\n' : '');
  const fs = { existsSync: jest.fn(() => false), readFileSync: jest.fn(), writeFileSync: jest.fn() };
  const result = gitOperations(execSync, fs, { info: jest.fn(), error: jest.fn() }, '1.0.0', { execFileSync });
  expect(result).toEqual({ commitSha: 'abc', tag: 'v1.0.0' });
  expect(execFileSync).toHaveBeenCalledWith('git', ['commit', '-m', expect.stringContaining('Version 1.0.0')], expect.any(Object));
  expect(execSync).not.toHaveBeenCalled();
});

test('uses the injected platform-resolved npm runner for package refreshes', () => {
  const execSync = jest.fn();
  const execFileSync = jest.fn((executable, args) => {
    if (args[0] === 'outdated') return JSON.stringify({ lodash: { current: '1.0.0', latest: '2.0.0' } });
    if (args[0] === 'rev-parse') return 'abc\n';
    return '';
  });
  const fs = {
    existsSync: jest.fn(file => file === 'package.json'),
    readFileSync: jest.fn(() => JSON.stringify({ version: '1.0.0' })),
    writeFileSync: jest.fn(),
  };
  gitOperations(execSync, fs, { info: jest.fn(), error: jest.fn() }, '1.0.1', { execFileSync });
  expect(execFileSync).toHaveBeenCalledWith(expect.stringMatching(/^npm(?:\.cmd)?$/), ['install'], expect.any(Object));
  expect(execFileSync).toHaveBeenCalledWith(expect.stringMatching(/^npm(?:\.cmd)?$/), ['update'], expect.any(Object));
  expect(execFileSync).toHaveBeenCalledWith(expect.stringMatching(/^npm(?:\.cmd)?$/), ['install', 'lodash@latest'], expect.any(Object));
  expect(execSync).not.toHaveBeenCalled();
});
