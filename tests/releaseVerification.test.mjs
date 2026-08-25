import { jest } from '@jest/globals';
import { sleepDefault, verifyRelease } from '../src/releaseVerification.mjs';

test('resolves the default delay helper', async () => {
  await expect(sleepDefault(0)).resolves.toBeUndefined();
});

test('verifies tag CI, npm propagation, and skips GHCR when not configured', async () => {
  const execSync = jest.fn(command => {
    if (command === 'git remote get-url origin') return 'git@github.com:eliware/demo.git';
    if (command.startsWith('gh run list')) return JSON.stringify([{ databaseId: 1, headSha: 'abc', headBranch: 'v1.0.0', url: 'https://github.com/eliware/demo/actions/runs/1' }]);
    if (command.startsWith('gh run view')) return JSON.stringify({ status: 'completed', conclusion: 'success', headSha: 'abc', url: 'https://github.com/eliware/demo/actions/runs/1', jobs: [
      { name: 'build (ubuntu-latest)', status: 'completed', conclusion: 'success', url: 'https://github.com/eliware/demo/actions/runs/1/jobs/2' },
      { name: 'build (windows-latest)', status: 'completed', conclusion: 'success', url: 'https://github.com/eliware/demo/actions/runs/1/jobs/3' },
      { name: 'publish', status: 'completed', conclusion: 'success', url: 'https://github.com/eliware/demo/actions/runs/1/jobs/4' },
    ] });
    if (command.startsWith('npm view')) return '1.0.0';
    return '';
  });
  const fs = { existsSync: jest.fn(file => file === 'package.json'), readFileSync: jest.fn(() => JSON.stringify({ name: '@eliware/demo' })) , readdirSync: jest.fn(() => []) };
  const log = { info: jest.fn() };
  const result = await verifyRelease(execSync, fs, log, { version: '1.0.0', release: { commitSha: 'abc' }, initialDelayMs: 0, sleep: async () => {} });
  expect(result).toMatchObject({ repo: 'eliware/demo', npm: true, ghcr: false });
  expect(log.info).toHaveBeenCalledWith(expect.stringContaining('Ubuntu:'));
});

test('reports failed release jobs', async () => {
  const execSync = jest.fn(command => command === 'git remote get-url origin' ? 'git@github.com:eliware/demo.git'
    : command.startsWith('gh run list') ? JSON.stringify([{ databaseId: 1, headSha: 'abc', headBranch: 'v1.0.0' }])
      : JSON.stringify({ status: 'completed', conclusion: 'failure', headSha: 'abc', jobs: [{ name: 'publish', status: 'completed', conclusion: 'failure' }] }));
  await expect(verifyRelease(execSync, { existsSync: jest.fn(() => false) }, { info: jest.fn() }, { version: '1.0.0', release: { commitSha: 'abc' }, sleep: async () => {} })).rejects.toThrow('publish: failure');
});

test('waits for pending CI and retries npm propagation', async () => {
  let views = 0;
  let npmReads = 0;
  const execSync = jest.fn(command => {
    if (command === 'git remote get-url origin') return 'https://github.com/eliware/demo.git';
    if (command.startsWith('gh run list')) return JSON.stringify([{ databaseId: 1, headSha: 'abc', headBranch: 'v1.0.0' }]);
    if (command.startsWith('gh run view')) {
      views += 1;
      return JSON.stringify(views === 1 ? { status: 'in_progress' } : { status: 'completed', conclusion: 'success', headSha: 'abc', jobs: [
        { name: 'ubuntu', status: 'completed', conclusion: 'success' }, { name: 'windows', status: 'completed', conclusion: 'success' },
      ] });
    }
    if (command.startsWith('npm view')) {
      npmReads += 1;
      if (npmReads === 1) throw new Error('404');
      return '1.0.0';
    }
    return '';
  });
  const sleep = jest.fn(async () => {});
  const fs = { existsSync: jest.fn(file => file === 'package.json'), readFileSync: jest.fn(() => JSON.stringify({ name: 'demo' })), readdirSync: jest.fn(() => []) };
  await expect(verifyRelease(execSync, fs, { info: jest.fn() }, { version: '1.0.0', release: { commitSha: 'abc' }, initialDelayMs: 0, npmRetryMs: 0, pollMs: 0, sleep })).resolves.toMatchObject({ npm: true });
  expect(npmReads).toBe(2);
});

test('reports missing CI, invalid remotes, and GHCR misses', async () => {
  const noRun = jest.fn(command => command === 'git remote get-url origin' ? 'git@github.com:eliware/demo.git' : command.startsWith('gh run list') ? '[]' : '');
  await expect(verifyRelease(noRun, { existsSync: jest.fn(() => false) }, { info: jest.fn() }, { version: '1.0.0', release: { commitSha: 'abc' }, maxPolls: 1, sleep: async () => {} })).rejects.toThrow('did not complete');
  const badRemote = jest.fn(() => 'local-only');
  await expect(verifyRelease(badRemote, { existsSync: jest.fn(() => false) }, { info: jest.fn() }, { version: '1.0.0', release: { commitSha: 'abc' }, maxPolls: 1, sleep: async () => {} })).rejects.toThrow('Cannot determine');
});

test('verifies GHCR tags and handles private or absent npm packages', async () => {
  const execSync = jest.fn(command => {
    if (command === 'git remote get-url origin') return 'git@github.com:eliware/demo.git';
    if (command.startsWith('gh run list')) return JSON.stringify([{ databaseId: 1, headSha: 'abc', headBranch: 'v1.0.0' }]);
    if (command.startsWith('gh run view')) return JSON.stringify({ status: 'completed', conclusion: 'success', headSha: 'abc', jobs: [
      { name: 'ubuntu', status: 'completed', conclusion: 'success' }, { name: 'windows', status: 'completed', conclusion: 'success' },
    ] });
    if (command.startsWith('gh api')) return JSON.stringify([{ metadata: { container: { tags: ['v1.0.0'] } } }]);
    return '';
  });
  const fs = { existsSync: jest.fn(file => file === 'package.json' || file === '.github/workflows'), readFileSync: jest.fn(file => file === 'package.json' ? JSON.stringify({ private: true }) : 'image: ghcr.io/eliware/demo'), readdirSync: jest.fn(() => ['ci.yml']) };
  await expect(verifyRelease(execSync, fs, { info: jest.fn() }, { version: '1.0.0', release: { commitSha: 'abc' }, sleep: async () => {} })).resolves.toMatchObject({ npm: false, ghcr: true });
});

test('rejects missing platform jobs and npm propagation exhaustion', async () => {
  const execSync = jest.fn(command => {
    if (command === 'git remote get-url origin') return 'git@github.com:eliware/demo.git';
    if (command.startsWith('gh run list')) return JSON.stringify([{ databaseId: 1, headSha: 'abc', headBranch: 'v1.0.0' }]);
    if (command.startsWith('gh run view')) return JSON.stringify({ status: 'completed', conclusion: 'success', headSha: 'abc', jobs: [] });
    return '';
  });
  await expect(verifyRelease(execSync, { existsSync: jest.fn(() => false) }, { info: jest.fn() }, { version: '1.0.0', release: { commitSha: 'abc' }, sleep: async () => {} })).rejects.toThrow('Ubuntu');
});

test('uses the real delay implementation when no sleep override is provided', async () => {
  const execSync = jest.fn(command => {
    if (command === 'git remote get-url origin') return 'git@github.com:eliware/demo.git';
    if (command.startsWith('gh run list')) return JSON.stringify([{ databaseId: 1, headSha: 'abc', headBranch: 'v1.0.0' }]);
    if (command.startsWith('gh run view')) return JSON.stringify({ status: 'completed', conclusion: 'success', headSha: 'abc', jobs: [
      { name: 'ubuntu', status: 'completed', conclusion: 'success' }, { name: 'windows', status: 'completed', conclusion: 'success' },
    ] });
    return '';
  });
  await expect(verifyRelease(execSync, { existsSync: jest.fn(() => false) }, { info: jest.fn() }, { version: '1.0.0', release: { commitSha: 'abc' }, initialDelayMs: 0, pollMs: 0, maxPolls: 1 })).resolves.toMatchObject({ npm: false });
});

test('reports detailed GHCR and CI edge failures', async () => {
  const base = command => {
    if (command === 'git remote get-url origin') return 'git@github.com:eliware/demo.git';
    if (command.startsWith('gh run list')) return JSON.stringify([{ databaseId: 1, headSha: 'old', headBranch: 'v1.0.0', status: 'completed', conclusion: 'success' }]);
    return '';
  };
  await expect(verifyRelease(jest.fn(base), { existsSync: jest.fn(() => false) }, { info: jest.fn() }, { version: '1.0.0', release: { commitSha: 'abc' }, maxPolls: 1, sleep: async () => {} })).rejects.toThrow('did not complete');

  const ghcr = jest.fn(command => {
    if (command === 'git remote get-url origin') return 'git@github.com:eliware/demo.git';
    if (command.startsWith('gh run list')) return JSON.stringify([{ databaseId: 1, headSha: 'abc', headBranch: 'v1.0.0' }]);
    if (command.startsWith('gh run view')) return JSON.stringify({ status: 'completed', conclusion: 'success', headSha: 'different', jobs: [
      { name: 'ubuntu', status: 'completed', conclusion: 'success' }, { name: 'windows', status: 'completed', conclusion: 'success' },
    ] });
    return JSON.stringify([{ metadata: { container: { tags: ['old'] } } }]);
  });
  const fs = { existsSync: jest.fn(file => file === '.github/workflows'), readdirSync: jest.fn(() => ['ci.yml']), readFileSync: jest.fn(() => 'image: ghcr.io/eliware/demo') };
  await expect(verifyRelease(ghcr, fs, { info: jest.fn() }, { version: '1.0.0', release: { commitSha: 'abc' }, sleep: async () => {} })).rejects.toThrow('GHCR does not expose');
});

test('reports npm visibility exhaustion and multiple publish links', async () => {
  let npmCalls = 0;
  const execSync = jest.fn(command => {
    if (command === 'git remote get-url origin') return 'git@github.com:eliware/demo.git';
    if (command.startsWith('gh run list')) return JSON.stringify([{ databaseId: 1, headSha: 'abc', headBranch: 'v1.0.0' }]);
    if (command.startsWith('gh run view')) return JSON.stringify({ status: 'completed', conclusion: 'success', headSha: 'abc', jobs: [
      { name: 'ubuntu', status: 'completed', conclusion: 'success' }, { name: 'windows', status: 'completed', conclusion: 'success' },
      { name: 'publish npm', status: 'completed', conclusion: 'success' }, { name: 'publish ghcr', status: 'completed', conclusion: 'success' },
    ] });
    if (command.startsWith('npm view')) { npmCalls += 1; throw new Error('404'); }
    return '';
  });
  const fs = { existsSync: jest.fn(file => file === 'package.json'), readFileSync: jest.fn(() => JSON.stringify({ name: 'demo' })), readdirSync: jest.fn(() => []) };
  await expect(verifyRelease(execSync, fs, { info: jest.fn() }, { version: '1.0.0', release: { commitSha: 'abc' }, initialDelayMs: 0, npmRetries: 2, npmRetryMs: 0, sleep: async () => {} })).rejects.toThrow('npm did not expose');
  expect(npmCalls).toBe(2);
});

test('retries when npm returns the wrong version', async () => {
  let reads = 0;
  const execSync = jest.fn(command => {
    if (command === 'git remote get-url origin') return 'git@github.com:eliware/demo.git';
    if (command.startsWith('gh run list')) return JSON.stringify([{ databaseId: 1, headSha: 'abc', headBranch: 'v1.0.0' }]);
    if (command.startsWith('gh run view')) return JSON.stringify({ status: 'completed', conclusion: 'success', headSha: 'abc', jobs: [
      { name: 'ubuntu', status: 'completed', conclusion: 'success' }, { name: 'windows', status: 'completed', conclusion: 'success' },
    ] });
    if (command.startsWith('npm view')) return reads++ === 0 ? '0.0.0' : '1.0.0';
    return '';
  });
  const fs = { existsSync: jest.fn(file => file === 'package.json'), readFileSync: jest.fn(() => JSON.stringify({ name: 'demo' })), readdirSync: jest.fn(() => []) };
  await expect(verifyRelease(execSync, fs, { info: jest.fn() }, { version: '1.0.0', release: { commitSha: 'abc' }, initialDelayMs: 0, npmRetries: 2, npmRetryMs: 0, sleep: async () => {} })).resolves.toMatchObject({ npm: true });
});

test('reports a matching CI run with incomplete job evidence', async () => {
  const execSync = jest.fn(command => {
    if (command === 'git remote get-url origin') return 'git@github.com:eliware/demo.git';
    if (command.startsWith('gh run list')) return JSON.stringify([
      { databaseId: 1, headSha: 'abc', headBranch: 'v1.0.0', status: 'completed', conclusion: 'success' },
    ]);
    return JSON.stringify({ status: 'completed', conclusion: 'success', headSha: 'abc', jobs: [
      { name: 'ubuntu', status: 'completed', conclusion: 'success' },
    ] });
  });
  await expect(verifyRelease(execSync, { existsSync: jest.fn(() => false) }, { info: jest.fn() }, { version: '1.0.0', release: { commitSha: 'abc' }, sleep: async () => {} })).rejects.toThrow('Windows');
});
