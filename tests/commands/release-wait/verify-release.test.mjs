import { jest } from '@jest/globals';
import { verifyRelease } from '../../../src/commands/release-wait/verify-release.mjs';

const log = { info: jest.fn() };
const validInput = { version: '1.0.0', release: { commitSha: 'abc' }, maxPolls: 1 };
const publicFs = {
  existsSync: jest.fn((file) => file === 'package.json'),
  readFileSync: jest.fn(() => JSON.stringify({ name: 'demo', private: false })),
  readdirSync: jest.fn(() => []),
};

function runners({
  list = [{ databaseId: 1, headSha: 'abc', headBranch: 'v1.0.0' }],
  details = {
    status: 'completed',
    conclusion: 'success',
    headSha: 'abc',
    jobs: [{ name: 'ubuntu', status: 'completed', conclusion: 'success' }],
  },
  remote = 'git@github.com:eliware/demo.git',
  registry = '1.0.0',
} = {}) {
  const execSync = jest.fn(() => remote);
  const execFile = jest.fn((executable, args, options, callback) => {
    if (args[1] === 'list') return callback(null, JSON.stringify(list), '');
    if (args[1] === 'view') return callback(null, JSON.stringify(details), '');
    return callback(null, registry, '');
  });
  return { execSync, execFile };
}

test('rejects invalid release identity and polling bounds', async () => {
  await expect(verifyRelease(jest.fn(), {}, log, { version: 'next', release: { commitSha: 'abc' } })).rejects.toThrow(
    'must be valid',
  );
  await expect(verifyRelease(jest.fn(), {}, log, { release: { commitSha: 'abc' } })).rejects.toThrow('must be valid');
  await expect(verifyRelease(jest.fn(), {}, log, { version: '1.0.0', release: {} })).rejects.toThrow('must be valid');
  await expect(verifyRelease(jest.fn(), {}, log, { ...validInput, maxPolls: 0 })).rejects.toThrow('polling bounds');
  await expect(verifyRelease(jest.fn(), {}, log, { ...validInput, pollMs: Number.NaN })).rejects.toThrow(
    'polling bounds',
  );
});

test('uses default polling dependencies on a completed links-only run', async () => {
  const runner = runners({
    details: {
      status: 'completed',
      conclusion: 'success',
      headSha: 'abc',
      jobs: [{ name: 'ubuntu', status: 'completed', conclusion: 'success' }],
    },
  });
  await expect(
    verifyRelease(runner.execSync, {}, log, {
      version: '1.0.0',
      release: { commitSha: 'abc' },
      maxPolls: 1,
      pollMs: 0,
      linksOnly: true,
      execFile: runner.execFile,
    }),
  ).resolves.toMatchObject({ linksOnly: true });
});
test('rejects when the release options object is omitted', async () => {
  await expect(verifyRelease(jest.fn(), {}, log)).rejects.toThrow('must be valid');
});

test('reports ambiguous metadata, invalid remotes, and exhausted inspection', async () => {
  const ambiguous = runners({
    list: [
      { databaseId: 1, headSha: 'abc', headBranch: 'v1.0.0' },
      { databaseId: 'bad', createdAt: 'bad', headSha: 'abc', headBranch: 'v1.0.0' },
    ],
  });
  await expect(
    verifyRelease(ambiguous.execSync, {}, log, { ...validInput, execFile: ambiguous.execFile }),
  ).rejects.toThrow('malformed');
  const invalidRemote = runners({ remote: 'not-a-github-remote' });
  await expect(verifyRelease(invalidRemote.execSync, {}, log, validInput)).rejects.toThrow('Cannot determine');
  const unavailable = {
    execSync: jest.fn(() => 'git@github.com:eliware/demo.git'),
    execFile: jest.fn((_a, _b, _c, callback) => callback(new Error('offline'), '', '')),
  };
  await expect(
    verifyRelease(unavailable.execSync, {}, log, { ...validInput, execFile: unavailable.execFile }),
  ).rejects.toThrow('inspection failed after');
});

test('retries transient CI inspection and reports a non-successful candidate', async () => {
  let attempts = 0;
  const transient = runners();
  transient.execFile.mockImplementation((executable, args, options, callback) => {
    if (args[1] === 'list' && attempts++ === 0) return callback(new Error('temporary'), '', '');
    if (args[1] === 'list')
      return callback(null, JSON.stringify([{ databaseId: 4, headSha: 'abc', headBranch: 'v1.0.0' }]), '');
    return callback(
      null,
      JSON.stringify({
        status: 'completed',
        conclusion: 'success',
        headSha: 'abc',
        jobs: [{ name: 'ubuntu', status: 'completed', conclusion: 'success' }],
      }),
      '',
    );
  });
  await expect(
    verifyRelease(transient.execSync, { existsSync: jest.fn(() => false) }, log, {
      ...validInput,
      maxPolls: 2,
      pollMs: 0,
      sleep: async () => {},
      execFile: transient.execFile,
    }),
  ).resolves.toMatchObject({ ci: true });
  const failed = runners({
    list: [{ databaseId: 5, status: 'completed', conclusion: 'cancelled', headSha: 'abc', headBranch: 'v1.0.0' }],
    details: { databaseId: 5, status: 'completed', conclusion: 'cancelled', headSha: 'abc', jobs: [] },
  });
  await expect(
    verifyRelease(failed.execSync, { existsSync: () => false }, log, { ...validInput, execFile: failed.execFile }),
  ).rejects.toThrow('cancelled');
  const absent = runners({ list: [] });
  await expect(verifyRelease(absent.execSync, {}, log, { ...validInput, execFile: absent.execFile })).rejects.toThrow(
    'did not complete',
  );
});

test('returns links-only evidence without waiting for registry checks', async () => {
  const { execSync, execFile } = runners({
    details: {
      status: 'in_progress',
      conclusion: '',
      headSha: 'abc',
      jobs: [
        { name: 'build', status: 'in_progress', conclusion: '' },
        { name: 'metadata-only', status: 'in_progress', conclusion: '' },
      ],
    },
  });
  await expect(
    verifyRelease(execSync, {}, log, { ...validInput, linksOnly: true, maxPolls: 1, execFile }),
  ).resolves.toMatchObject({ linksOnly: true });
  const empty = runners({ details: { status: 'in_progress', conclusion: '', headSha: 'abc', jobs: [] } });
  await expect(
    verifyRelease(empty.execSync, {}, log, { ...validInput, linksOnly: true, maxPolls: 1, execFile: empty.execFile }),
  ).resolves.toMatchObject({ linksOnly: true });
});

test('waits for pending CI, then verifies public npm publication', async () => {
  let views = 0;
  const execSync = jest.fn(() => 'https://github.com/eliware/demo.git');
  const execFile = jest.fn((executable, args, options, callback) => {
    if (args[1] === 'list')
      return callback(null, JSON.stringify([{ databaseId: 2, headSha: 'abc', headBranch: 'v1.0.0' }]), '');
    if (args[1] === 'view')
      return callback(
        null,
        JSON.stringify(
          views++ === 0
            ? { status: 'in_progress', conclusion: '', headSha: 'abc', jobs: [] }
            : {
                status: 'completed',
                conclusion: 'success',
                headSha: 'abc',
                jobs: [
                  { name: 'ubuntu', status: 'completed', conclusion: 'success' },
                  { name: 'publish', status: 'completed', conclusion: 'success' },
                ],
              },
        ),
        '',
      );
    return callback(null, '"1.0.0"', '');
  });
  await expect(
    verifyRelease(execSync, publicFs, log, {
      ...validInput,
      maxPolls: 2,
      pollMs: 0,
      npmRetryMs: 0,
      sleep: async () => {},
      execFile,
    }),
  ).resolves.toMatchObject({ ci: true, npm: true });
});

test('reports mismatched details and completed workflow failure', async () => {
  const mismatch = runners({ details: { status: 'completed', conclusion: 'success', headSha: 'other', jobs: [] } });
  await expect(
    verifyRelease(mismatch.execSync, {}, log, { ...validInput, execFile: mismatch.execFile }),
  ).rejects.toThrow('expected abc');
  const failed = runners({ details: { status: 'completed', conclusion: 'cancelled', headSha: 'abc', jobs: [] } });
  await expect(verifyRelease(failed.execSync, {}, log, { ...validInput, execFile: failed.execFile })).rejects.toThrow(
    'Release CI failed',
  );
  const unknown = runners({ details: { status: 'completed', conclusion: 'success', headSha: undefined, jobs: [] } });
  await expect(verifyRelease(unknown.execSync, {}, log, { ...validInput, execFile: unknown.execFile })).rejects.toThrow(
    'malformed details',
  );
});

test('requires Ubuntu, publish, and passing Windows when applicable', async () => {
  const noUbuntu = runners({ details: { status: 'completed', conclusion: 'success', headSha: 'abc', jobs: [] } });
  await expect(
    verifyRelease(noUbuntu.execSync, {}, log, { ...validInput, execFile: noUbuntu.execFile }),
  ).rejects.toThrow('Ubuntu');
  const noPublish = runners({
    details: {
      status: 'completed',
      conclusion: 'success',
      headSha: 'abc',
      jobs: [{ name: 'ubuntu', status: 'completed', conclusion: 'success' }],
    },
  });
  await expect(
    verifyRelease(noPublish.execSync, publicFs, log, { ...validInput, execFile: noPublish.execFile }),
  ).rejects.toThrow('publish job');
  const failedWindows = runners({
    details: {
      status: 'completed',
      conclusion: 'success',
      headSha: 'abc',
      jobs: [
        { name: 'ubuntu', status: 'completed', conclusion: 'success' },
        { name: 'windows', status: 'completed', conclusion: 'failure' },
      ],
    },
  });
  await expect(
    verifyRelease(failedWindows.execSync, {}, log, { ...validInput, execFile: failedWindows.execFile }),
  ).rejects.toThrow('failing Windows');
  const malformedJobs = runners({ details: { status: 'completed', conclusion: 'success', headSha: 'abc', jobs: {} } });
  await expect(
    verifyRelease(malformedJobs.execSync, {}, log, { ...validInput, execFile: malformedJobs.execFile }),
  ).rejects.toThrow('malformed details');
});

test('supports refs/tags, skipped optional jobs, private packages, and GHCR', async () => {
  const tagged = runners({
    list: [{ databaseId: 3, headSha: 'abc', headBranch: 'refs/tags/v1.0.0' }],
    details: {
      status: 'completed',
      conclusion: 'success',
      headSha: 'abc',
      jobs: [
        { name: 'ubuntu', status: 'completed', conclusion: 'success' },
        { name: 'optional', status: 'completed', conclusion: 'skipped' },
      ],
    },
  });
  await expect(
    verifyRelease(tagged.execSync, { existsSync: jest.fn(() => false) }, log, {
      ...validInput,
      execFile: tagged.execFile,
    }),
  ).resolves.toMatchObject({ ci: true, npm: false });
  const digest = `sha256:${'a'.repeat(64)}`;
  const ghcr = runners({
    details: {
      status: 'completed',
      conclusion: 'success',
      headSha: 'abc',
      jobs: [
        { name: 'ubuntu', status: 'completed', conclusion: 'success', url: 'https://ci/ubuntu' },
        { name: 'publish', status: 'completed', conclusion: 'success', url: 'https://ci/publish' },
        { name: 'publish ghcr', status: 'completed', conclusion: 'success', url: 'https://ci/ghcr' },
      ],
    },
    registry: JSON.stringify([{ name: digest, metadata: { container: { tags: ['v1.0.0'] } } }]),
  });
  const fs = {
    existsSync: jest.fn((file) => file === '.github/workflows'),
    readdirSync: jest.fn(() => ['ci.yml']),
    readFileSync: jest.fn(() => 'ghcr.io/eliware/demo'),
  };
  await expect(
    verifyRelease(ghcr.execSync, fs, log, {
      ...validInput,
      release: { ...validInput.release, imageDigest: digest },
      execFile: ghcr.execFile,
      pollMs: 0,
      sleep: async () => {},
      maxPolls: 1,
    }),
  ).resolves.toMatchObject({ ghcr: true });
  await expect(
    verifyRelease(ghcr.execSync, fs, log, {
      ...validInput,
      execFile: ghcr.execFile,
      pollMs: 0,
      sleep: async () => {},
      maxPolls: 1,
    }),
  ).resolves.toMatchObject({ ghcr: true });
  const publicGhcrFs = {
    existsSync: jest.fn((file) => file === 'package.json' || file === '.github/workflows'),
    readdirSync: jest.fn(() => ['ci.yml']),
    readFileSync: jest.fn((file) =>
      file === 'package.json' ? JSON.stringify({ name: 'demo', private: false }) : 'ghcr.io/eliware/demo',
    ),
  };
  const publicExec = jest.fn((executable, args, options, callback) =>
    executable === 'npm' || executable === 'npm.cmd' || (executable === 'cmd.exe' && args.includes('npm.cmd'))
      ? callback(null, '"1.0.0"', '')
      : ghcr.execFile(executable, args, options, callback),
  );
  await expect(
    verifyRelease(ghcr.execSync, publicGhcrFs, log, {
      ...validInput,
      release: { ...validInput.release, imageDigest: digest },
      execFile: publicExec,
      pollMs: 0,
      sleep: async () => {},
      maxPolls: 1,
    }),
  ).resolves.toMatchObject({ ghcr: true, npm: true });
});
