import { jest } from '@jest/globals';
import { hasStrict100x4, runPreflight, verifyLatestCi } from '../src/releaseChecks.mjs';

test('detects strict 100x4 coverage', () => {
  expect(hasStrict100x4('All files     100     100     100     100')).toBe(true);
  expect(hasStrict100x4('All files                |     100 |      100 |     100 |     100 |')).toBe(true);
  expect(hasStrict100x4('All files      99     100     100     100')).toBe(false);
});

test('preflight runs clean-tree, test, lint, and audit gates', () => {
  const execSync = jest.fn(command => {
    if (command === 'git status --short --untracked-files=all') return '';
    if (command === 'npm test') return 'All files     100     100     100     100';
    return '';
  });
  const fs = {
    existsSync: jest.fn(file => file === 'package.json'),
    readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'jest', audit: 'audit' } })),
  };
  const log = { info: jest.fn() };

  const result = runPreflight(execSync, fs, log);

  expect(result.test.passed).toBe(true);
  expect(execSync).toHaveBeenCalledWith('npm run lint', expect.any(Object));
  expect(execSync).toHaveBeenCalledWith('npm audit --omit=dev --audit-level=moderate', expect.any(Object));
});

test('preflight rejects dirty trees before running package commands', () => {
  const execSync = jest.fn(() => ' M package.json\n');
  const fs = { existsSync: jest.fn(() => false) };

  expect(() => runPreflight(execSync, fs, { info: jest.fn() })).toThrow('Working tree is not clean');
  expect(execSync).toHaveBeenCalledTimes(1);
});

test('preflight honors an explicit 100x4 waiver and audit fallback', () => {
  const execSync = jest.fn(command => command === 'git status --short --untracked-files=all'
    ? '' : 'not 100x4');
  const fs = {
    existsSync: jest.fn(file => file === 'package.json'),
    readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'jest' } })),
  };

  expect(runPreflight(execSync, fs, { info: jest.fn() }, { ignore100x4: true })).toHaveProperty('test.passed', true);
  expect(execSync).toHaveBeenCalledWith('npm audit --omit=dev --audit-level=moderate', expect.any(Object));
});

test('preflight blocks missing strict 100x4 coverage', () => {
  const execSync = jest.fn(command => command === 'git status --short --untracked-files=all' ? '' : '');
  const fs = {
    existsSync: jest.fn(file => file === 'package.json'),
    readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'jest' } })),
  };
  expect(() => runPreflight(execSync, fs, { info: jest.fn() })).toThrow('strict 100x4');
});

test('preflight reports command failures and disabled releases', () => {
  const fs = { existsSync: jest.fn(() => false) };
  const failingExec = jest.fn(command => command === 'npm run lint' ? (() => { throw { stdout: 'bad', stderr: 'lint' }; })() : '');
  expect(() => runPreflight(failingExec, fs, { info: jest.fn() })).toThrow('Preflight lint failed');
  expect(() => runPreflight(jest.fn(), { existsSync: jest.fn(() => true) }, { info: jest.fn() }))
    .toThrow('.notag file detected');
});

test('preflight supports projects without a test script', () => {
  const execSync = jest.fn(command => command === 'git status --short --untracked-files=all' ? '' : '');
  const fs = {
    existsSync: jest.fn(file => file === 'package.json'),
    readFileSync: jest.fn(() => JSON.stringify({ scripts: { audit: 'audit' } })),
  };
  expect(runPreflight(execSync, fs, { info: jest.fn() })).toHaveProperty('audit.passed', true);
});

test('preflight handles failures without captured output', () => {
  const execSync = jest.fn(command => {
    if (command === 'git status --short --untracked-files=all') return '';
    throw new Error('failed');
  });
  expect(() => runPreflight(execSync, { existsSync: jest.fn(() => false) }, { info: jest.fn() }))
    .toThrow('Preflight lint failed');
});

test('verifies a successful exact-head CI run on Ubuntu and Windows', () => {
  const execSync = jest.fn(command => {
    if (command.startsWith('gh run list')) return JSON.stringify([
      { databaseId: 42, status: 'completed', conclusion: 'success', headSha: 'abc' },
    ]);
    return JSON.stringify({ headSha: 'abc', jobs: [
      { name: 'Test (ubuntu-latest)', status: 'completed', conclusion: 'success' },
      { name: 'Test (windows-latest)', status: 'completed', conclusion: 'success' },
    ] });
  });
  expect(verifyLatestCi(execSync, { info: jest.fn() }, { headSha: 'abc', repository: 'eliware/tagit' }))
    .toEqual({ runId: 42, headSha: 'abc', ubuntu: true, windows: true });
});

test('rejects missing, malformed, unsuccessful, stale, and incomplete CI evidence', () => {
  expect(() => verifyLatestCi(jest.fn(), { info: jest.fn() })).toThrow('commit SHA is required');
  expect(() => verifyLatestCi(jest.fn(() => '{bad'), { info: jest.fn() }, { headSha: 'abc' }))
    .toThrow('Unable to inspect');
  const noRun = jest.fn(() => '[]');
  expect(() => verifyLatestCi(noRun, { info: jest.fn() }, { headSha: 'abc' })).toThrow('No successful');
  const stale = jest.fn(command => command.startsWith('gh run list')
    ? JSON.stringify([{ databaseId: 1, status: 'completed', conclusion: 'success', headSha: 'old' }])
    : '');
  expect(() => verifyLatestCi(stale, { info: jest.fn() }, { headSha: 'abc' })).toThrow('No successful');
  const incomplete = jest.fn(command => command.startsWith('gh run list')
    ? JSON.stringify([{ databaseId: 1, status: 'completed', conclusion: 'success', headSha: 'abc' }])
    : JSON.stringify({ headSha: 'abc', jobs: [{ name: 'Test (ubuntu-latest)', status: 'completed', conclusion: 'success' }] }));
  expect(() => verifyLatestCi(incomplete, { info: jest.fn() }, { headSha: 'abc' })).toThrow('lacks passing');
  const noJobs = jest.fn(command => command.startsWith('gh run list')
    ? JSON.stringify([{ databaseId: 1, status: 'completed', conclusion: 'success', headSha: 'abc' }])
    : JSON.stringify({ headSha: 'abc' }));
  expect(() => verifyLatestCi(noJobs, { info: jest.fn() }, { headSha: 'abc' })).toThrow('lacks passing');
});

test('preflight verifies CI for the exact current HEAD', () => {
  const execSync = jest.fn(command => {
    if (command === 'git status --short --untracked-files=all') return '';
    if (command === 'git rev-parse HEAD') return 'abc';
    if (command.startsWith('gh run list')) return JSON.stringify([{ databaseId: 42, status: 'completed', conclusion: 'success', headSha: 'abc' }]);
    if (command.startsWith('gh run view')) return JSON.stringify({ headSha: 'abc', jobs: [
      { name: 'Ubuntu', status: 'completed', conclusion: 'success' },
      { name: 'Windows', status: 'completed', conclusion: 'success' },
    ] });
    if (command === 'npm test') return 'All files     100     100     100     100';
    return '';
  });
  const fs = { existsSync: jest.fn(file => file === 'package.json'), readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'eliware-test' } })) };
  expect(runPreflight(execSync, fs, { info: jest.fn() }, { verifyCi: true })).toHaveProperty('ci.ubuntu', true);
});
