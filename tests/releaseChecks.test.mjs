import { jest } from '@jest/globals';
import { hasStrict100x4, runPreflight, waitForGitHubRun } from '../src/releaseChecks.mjs';

test('detects strict 100x4 coverage', () => {
  expect(hasStrict100x4('All files     100     100     100     100')).toBe(true);
  expect(hasStrict100x4('All files                |     100 |      100 |     100 |     100 |')).toBe(true);
  expect(hasStrict100x4('All files      99     100     100     100')).toBe(false);
  expect(hasStrict100x4('all files  |  100.00  |  100.00  |  100.00  |  ')).toBe(true);
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
  expect(execSync).toHaveBeenCalledWith('npm run audit', expect.any(Object));
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

test('waits for a successful GitHub Actions run', async () => {
  const execSync = jest.fn(() => JSON.stringify({ status: 'completed', conclusion: 'success', headSha: 'abc' }));
  const result = await waitForGitHubRun(execSync, { info: jest.fn() }, {
    runId: '123',
    sleep: async () => {},
  });

  expect(result.headSha).toBe('abc');
  expect(execSync).toHaveBeenCalledWith('gh run view 123 --json status,conclusion,headSha', expect.any(Object));
});

test('fails when GitHub Actions concludes unsuccessfully', async () => {
  const execSync = jest.fn(() => JSON.stringify({ status: 'completed', conclusion: 'failure' }));

  await expect(waitForGitHubRun(execSync, { info: jest.fn() }, { runId: '123' }))
    .rejects.toThrow('concluded failure');
});

test('waits through an in-progress run and rejects malformed, missing, and timed-out runs', async () => {
  let calls = 0;
  const execSync = jest.fn(() => calls++ === 0
    ? JSON.stringify({ status: 'in_progress' })
    : JSON.stringify({ status: 'completed', conclusion: 'success' }));
  let clock = 0;
  await expect(waitForGitHubRun(execSync, { info: jest.fn() }, {
    runId: '123', now: () => clock++, sleep: async () => {},
  })).resolves.toHaveProperty('status', 'completed');
  await expect(waitForGitHubRun(jest.fn(() => '{bad'), { info: jest.fn() }, { runId: '123' }))
    .rejects.toThrow('Unable to inspect');
  await expect(waitForGitHubRun(jest.fn(() => JSON.stringify({ status: 'queued' })), { info: jest.fn() }, {
    runId: '123', timeoutMs: 1, intervalMs: 0, now: (() => { const values = [0, 0, 2]; let index = 0; return () => values[index++] ?? 2; })(),
  })).rejects.toThrow('timeout');
  expect(() => waitForGitHubRun(jest.fn(), { info: jest.fn() })).toThrow('run ID is required');
});
