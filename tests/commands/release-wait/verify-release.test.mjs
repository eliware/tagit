import { jest } from '@jest/globals';
import { verifyRelease } from '../../../src/commands/release-wait/verify-release.mjs';

const log = { info: jest.fn() };
const input = { version: '1.0.0', release: { commitSha: 'abc' }, maxPolls: 1, pollMs: 0, npmRetries: 1, npmRetryMs: 0 };
const fs = {
  existsSync: jest.fn((file) => file === 'package.json' || file === '.github/workflows'),
  readFileSync: jest.fn((file) =>
    file === 'package.json' ? JSON.stringify({ name: 'demo', private: false }) : 'publish',
  ),
  readdirSync: jest.fn(() => ['ci.yml']),
};

function execFileSync(command, args) {
  if (args[0] === 'remote') return 'git@github.com:eliware/demo.git';
  return args[0] === 'describe' ? 'v1.0.0' : 'abc';
}

function execFile(_command, args, _options, callback) {
  if (args[1] === 'list')
    return callback(null, JSON.stringify([{ databaseId: 1, headSha: 'abc', headBranch: 'v1.0.0' }]), '');
  if (args[1] === 'view')
    return callback(
      null,
      JSON.stringify({
        databaseId: 1,
        status: 'completed',
        conclusion: 'success',
        headSha: 'abc',
        jobs: [
          { name: 'ubuntu', status: 'completed', conclusion: 'success' },
          { name: 'publish', status: 'completed', conclusion: 'success' },
        ],
      }),
      '',
    );
  return callback(null, JSON.stringify('1.0.0'), '');
}

test('rejects invalid release input before external inspection', async () => {
  await expect(verifyRelease(jest.fn(), fs, log, { version: 'next', release: { commitSha: 'abc' } })).rejects.toThrow(
    'must be valid',
  );
});

test('rejects omitted release options through the default boundary', async () => {
  await expect(verifyRelease(jest.fn(), fs, log)).rejects.toThrow();
});

test('returns links-only CI evidence without registry verification', async () => {
  await expect(verifyRelease(execFileSync, fs, log, { ...input, linksOnly: true, execFile })).resolves.toMatchObject({
    runId: 1,
  });
});

test('runs publication verification after successful CI', async () => {
  await expect(verifyRelease(execFileSync, fs, log, { ...input, execFile })).resolves.toBeDefined();
});

test('rejects when CI details are invalid or the release identity is unavailable', async () => {
  const bad = jest.fn((_command, args, _options, callback) => {
    if (args[1] === 'list')
      return callback(null, JSON.stringify([{ databaseId: 2, headSha: 'abc', headBranch: 'v1.0.0' }]), '');
    return callback(
      null,
      JSON.stringify({ databaseId: 2, status: 'completed', conclusion: 'failure', headSha: 'abc', jobs: [] }),
      '',
    );
  });
  await expect(verifyRelease(execFileSync, fs, log, { ...input, execFile: bad })).rejects.toThrow();
});
