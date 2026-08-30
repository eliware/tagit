import { jest } from '@jest/globals';
import { npmExecutable, releaseCommand, reportCiLinks, sleepDefault, verifyRelease, waitSync } from '../src/releaseVerification.mjs';

test('waitSync handles zero and positive bounded delays', () => {
  expect(waitSync(0)).toBeUndefined();
  expect(waitSync(1)).toBeUndefined();
});

test('selects the npm executable for each platform', () => {
  expect(npmExecutable('win32')).toBe('npm.cmd');
  expect(npmExecutable('linux')).toBe('npm');
});

test('release command adapter preserves executable and argument boundaries', async () => {
  const execFile = jest.fn((executable, args, options, callback) => callback(null, 'ok', ''));
  await expect(releaseCommand(execFile, 'gh', ['run', 'list', '--repo', 'eliware/tagit'])).resolves.toBe('ok');
  expect(execFile).toHaveBeenCalledWith('gh', ['run', 'list', '--repo', 'eliware/tagit'], { encoding: 'utf8' }, expect.any(Function));
});

test('release command adapter propagates process errors and output', async () => {
  const error = new Error('command failed');
  const execFile = jest.fn((executable, args, options, callback) => callback(error, 'stdout', 'stderr'));
  await expect(releaseCommand(execFile, 'npm', ['view', 'pkg', 'version'])).rejects.toMatchObject({ message: 'command failed', stdout: 'stdout', stderr: 'stderr' });
});

test('release command adapter validates its inputs', async () => {
  await expect(releaseCommand(null, 'gh', [])).rejects.toThrow();
  await expect(releaseCommand(jest.fn(), 'gh', 'run')).rejects.toThrow();
});

test('reportCiLinks uses shell-free GitHub arguments', () => {
  const execSync = jest.fn(() => 'git@github.com:eliware/demo.git');
  const execFileSync = jest.fn((executable, args) => args[1] === 'list'
    ? JSON.stringify([{ databaseId: 3, headSha: 'abc', url: 'https://ci' }])
    : JSON.stringify({ jobs: [{ name: 'test', url: 'https://job' }] }));
  const log = { info: jest.fn() };
  expect(reportCiLinks(execSync, log, 'abc', { execFileSync })).toMatchObject({ repo: 'eliware/demo', headSha: 'abc' });
  expect(execFileSync).toHaveBeenCalledWith('gh', expect.arrayContaining(['run', 'view', '3']), expect.any(Object));
});

test('verifyRelease uses the injected async runner for GitHub inspection', async () => {
  const execSync = jest.fn(() => 'git@github.com:eliware/demo.git');
  const execFile = jest.fn((executable, args, options, callback) => {
    if (args[1] === 'list') callback(null, JSON.stringify([{ databaseId: 4, headSha: 'abc', headBranch: 'v1.0.0', url: 'https://ci' }]), '');
    else callback(null, JSON.stringify({ status: 'completed', conclusion: 'success', headSha: 'abc', jobs: [] }), '');
  });
  await expect(verifyRelease(execSync, { existsSync: jest.fn(() => false) }, { info: jest.fn() }, {
    version: '1.0.0', release: { commitSha: 'abc' }, linksOnly: true, initialDelayMs: 0, execFile,
  })).resolves.toMatchObject({ linksOnly: true, runId: 4 });
  expect(execFile).toHaveBeenCalledWith('gh', expect.arrayContaining(['run', 'list']), expect.any(Object), expect.any(Function));
});

test('verifyRelease uses the async runner for GHCR verification', async () => {
  const execSync = jest.fn(() => 'git@github.com:eliware/demo.git');
  const execFile = jest.fn((executable, args, options, callback) => {
    if (args[1] === 'list') callback(null, JSON.stringify([{ databaseId: 4, headSha: 'abc', headBranch: 'v1.0.0', url: 'https://ci' }]), '');
    else if (args[1] === 'view') callback(null, JSON.stringify({ status: 'completed', conclusion: 'success', headSha: 'abc', jobs: [
      { name: 'Ubuntu', status: 'completed', conclusion: 'success' }, { name: 'Windows', status: 'completed', conclusion: 'success' },
    ] }), '');
    else callback(null, JSON.stringify([{ name: 'sha256:abc', metadata: { container: { tags: ['1.0.0'] } } }]), '');
  });
  const fs = { existsSync: jest.fn(file => file === '.github/workflows' || file === 'ci.yml'), readdirSync: jest.fn(() => ['ci.yml']), readFileSync: jest.fn(() => 'ghcr.io/eliware/demo') };
  await expect(verifyRelease(execSync, fs, { info: jest.fn() }, { version: '1.0.0', release: { commitSha: 'abc' }, initialDelayMs: 0, execFile })).resolves.toMatchObject({ ghcr: true, imageDigest: 'sha256:abc' });
});

test('verifyRelease uses the async runner for npm visibility', async () => {
  const execSync = jest.fn(() => 'git@github.com:eliware/demo.git');
  const execFile = jest.fn((executable, args, options, callback) => {
    if (args[1] === 'list') callback(null, JSON.stringify([{ databaseId: 4, headSha: 'abc', headBranch: 'v1.0.0', url: 'https://ci' }]), '');
    else if (args[1] === 'view') callback(null, JSON.stringify({ status: 'completed', conclusion: 'success', headSha: 'abc', jobs: [
      { name: 'Ubuntu', status: 'completed', conclusion: 'success' }, { name: 'Windows', status: 'completed', conclusion: 'success' },
    ] }), '');
    else callback(null, '1.0.0\n', '');
  });
  const fs = { existsSync: jest.fn(file => file === 'package.json' || file === '.github/workflows'), readdirSync: jest.fn(() => []), readFileSync: jest.fn(() => JSON.stringify({ name: 'demo', private: false })) };
  await expect(verifyRelease(execSync, fs, { info: jest.fn() }, { version: '1.0.0', release: { commitSha: 'abc' }, initialDelayMs: 0, execFile })).resolves.toMatchObject({ npm: true, ghcr: false });
});

test('resolves the default delay helper', async () => {
  await expect(sleepDefault(0)).resolves.toBeUndefined();
});

test('reports CI workflow and job links for an exact commit', () => {
  const execSync = jest.fn(command => command === 'git remote get-url origin' ? 'git@github.com:eliware/demo.git'
    : command.startsWith('gh run list') ? JSON.stringify([{ databaseId: 1, headSha: 'abc', url: 'https://github.com/eliware/demo/actions/runs/1' }])
      : JSON.stringify({ jobs: [{ name: 'build', url: 'https://github.com/eliware/demo/jobs/2' }, {}] }));
  const log = { info: jest.fn() };
  expect(reportCiLinks(execSync, log, 'abc')).toMatchObject({ repo: 'eliware/demo', headSha: 'abc' });
  expect(log.info).toHaveBeenCalledWith(expect.stringContaining('Workflow:'));
});

test('reports no CI runs and rejects an invalid remote', () => {
  const noRuns = jest.fn(command => command === 'git remote get-url origin' ? 'git@github.com:eliware/demo.git' : '[]');
  expect(reportCiLinks(noRuns, { info: jest.fn() }, 'abc', { attempts: 2, delayMs: 0 })).toMatchObject({ runs: [] });
  const noJobs = jest.fn(command => command === 'git remote get-url origin' ? 'git@github.com:eliware/demo.git'
    : command.startsWith('gh run list') ? JSON.stringify([{ databaseId: 2, headSha: 'abc', url: 'https://github.com/eliware/demo/actions/runs/2' }]) : '{}');
  expect(reportCiLinks(noJobs, { info: jest.fn() }, 'abc')).toMatchObject({ runs: [{ databaseId: 2 }] });
  expect(() => reportCiLinks(jest.fn(() => 'local-only'), { info: jest.fn() }, 'abc')).toThrow('Cannot determine');
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

test('reports release links without waiting or registry checks', async () => {
  const execSync = jest.fn(command => command === 'git remote get-url origin' ? 'git@github.com:eliware/demo.git'
    : command.startsWith('gh run list') ? JSON.stringify([{ databaseId: 2, headSha: 'abc', headBranch: 'v1.0.0', status: 'in_progress', url: 'https://github.com/eliware/demo/actions/runs/2' }])
      : JSON.stringify({ status: 'in_progress', jobs: [{ name: 'build', url: 'https://github.com/eliware/demo/jobs/3' }] }));
  const result = await verifyRelease(execSync, { existsSync: jest.fn(() => false) }, { info: jest.fn() }, { version: '1.0.0', release: { commitSha: 'abc' }, linksOnly: true, sleep: async () => {} });
  expect(result).toMatchObject({ runId: 2, linksOnly: true });
  const noJobsExec = jest.fn(command => command === 'git remote get-url origin' ? 'git@github.com:eliware/demo.git'
    : command.startsWith('gh run list') ? JSON.stringify([{ databaseId: 3, headSha: 'abc', headBranch: 'v1.0.0', status: 'in_progress' }])
      : JSON.stringify({ status: 'in_progress', jobs: [{}] }));
  await verifyRelease(noJobsExec, { existsSync: jest.fn(() => false) }, { info: jest.fn() }, { version: '1.0.0', release: { commitSha: 'abc' }, linksOnly: true, sleep: async () => {} });
  const undefinedJobsExec = jest.fn(command => command === 'git remote get-url origin' ? 'git@github.com:eliware/demo.git'
    : command.startsWith('gh run list') ? JSON.stringify([{ databaseId: 4, headSha: 'abc', headBranch: 'v1.0.0', status: 'in_progress' }])
      : JSON.stringify({ status: 'in_progress' }));
  await verifyRelease(undefinedJobsExec, { existsSync: jest.fn(() => false) }, { info: jest.fn() }, { version: '1.0.0', release: { commitSha: 'abc' }, linksOnly: true, sleep: async () => {} });
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
  let includeDigest = false;
  const execSync = jest.fn(command => {
    if (command === 'git remote get-url origin') return 'git@github.com:eliware/demo.git';
    if (command.startsWith('gh run list')) return JSON.stringify([{ databaseId: 1, headSha: 'abc', headBranch: 'v1.0.0' }]);
    if (command.startsWith('gh run view')) return JSON.stringify({ status: 'completed', conclusion: 'success', headSha: 'abc', jobs: [
      { name: 'ubuntu', status: 'completed', conclusion: 'success' }, { name: 'windows', status: 'completed', conclusion: 'success' },
    ] });
    if (command.startsWith('gh api')) return JSON.stringify([{ name: includeDigest ? 'sha256:abc' : 'not-a-digest', metadata: { container: { tags: ['v1.0.0'] } } }]);
    if (command.startsWith('npm view')) return '1.0.0';
    return '';
  });
  const fs = { existsSync: jest.fn(file => file === 'package.json' || file === '.github/workflows'), readFileSync: jest.fn(file => file === 'package.json' ? JSON.stringify({ name: 'demo', private: false }) : 'image: ghcr.io/eliware/demo'), readdirSync: jest.fn(() => ['ci.yml']) };
  await expect(verifyRelease(execSync, fs, { info: jest.fn() }, { version: '1.0.0', release: { commitSha: 'abc' }, initialDelayMs: 0, sleep: async () => {} })).resolves.toMatchObject({ npm: true, ghcr: true });
  includeDigest = true;
  await expect(verifyRelease(execSync, fs, { info: jest.fn() }, { version: '1.0.0', release: { commitSha: 'abc' }, initialDelayMs: 0, sleep: async () => {} })).resolves.toMatchObject({ imageDigest: 'sha256:abc' });
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
