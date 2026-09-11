import { jest } from '@jest/globals';
import { pollReleaseCi } from '../../../src/commands/release-wait/release-ci-status.mjs';

const options = {
  repo: 'eliware/demo',
  headSha: 'abc',
  tag: 'v1.0.0',
  pollMs: 0,
  sleep: jest.fn(),
  linksOnly: false,
  log: { info: jest.fn() },
};

function executor(list, details) {
  return jest.fn((_command, args, _options, callback) =>
    callback(null, args[1] === 'list' ? JSON.stringify(list) : JSON.stringify(details), ''),
  );
}

test('selects and returns a completed release workflow', async () => {
  const run = { databaseId: 1, createdAt: '2026-01-01', headSha: 'abc', headBranch: 'v1.0.0' };
  const details = { databaseId: 1, status: 'completed', conclusion: 'success', headSha: 'abc', jobs: [] };
  await expect(pollReleaseCi({ ...options, execFile: executor([run], details), maxPolls: 1 })).resolves.toMatchObject({
    databaseId: 1,
  });
});

test('returns links-only evidence without waiting for completion', async () => {
  const run = { databaseId: 2, createdAt: '2026-01-01', headSha: 'abc', headBranch: 'v1.0.0' };
  const details = { databaseId: 2, status: 'in_progress', conclusion: null, headSha: 'abc', jobs: [] };
  await expect(
    pollReleaseCi({ ...options, execFile: executor([run], details), maxPolls: 1, linksOnly: true }),
  ).resolves.toMatchObject({ databaseId: 2 });
});

test('reports malformed list data and exhausted inspection', async () => {
  const malformed = jest.fn((_command, args, _options, callback) =>
    callback(null, args[1] === 'list' ? '{bad' : '{}', ''),
  );
  await expect(pollReleaseCi({ ...options, execFile: malformed, maxPolls: 1 })).rejects.toThrow('malformed list JSON');
  await expect(
    pollReleaseCi({
      ...options,
      execFile: jest.fn((_command, _args, _options, callback) => callback(new Error('network'), '', '')),
      maxPolls: 1,
    }),
  ).rejects.toThrow('inspection failed');
});

test('reports completed release failures and waits for pending runs', async () => {
  const failed = { databaseId: 3, createdAt: '2026-01-01', headSha: 'abc', headBranch: 'v1.0.0' };
  await expect(
    pollReleaseCi({
      ...options,
      execFile: executor([failed], {
        databaseId: 3,
        status: 'completed',
        conclusion: 'failure',
        headSha: 'abc',
        jobs: [],
      }),
      maxPolls: 1,
    }),
  ).rejects.toThrow();
  const pending = { databaseId: 4, createdAt: '2026-01-01', headSha: 'abc', headBranch: 'v1.0.0' };
  const exec = executor([pending], {
    databaseId: 4,
    status: 'in_progress',
    conclusion: null,
    headSha: 'abc',
    jobs: [],
  });
  await expect(pollReleaseCi({ ...options, execFile: exec, maxPolls: 1 })).rejects.toThrow('did not complete');
});

test('retries transient list inspection before finding the workflow', async () => {
  let attempts = 0;
  const run = { databaseId: 5, createdAt: '2026-01-01', headSha: 'abc', headBranch: 'v1.0.0' };
  const details = { databaseId: 5, status: 'completed', conclusion: 'success', headSha: 'abc', jobs: [] };
  const execFile = jest.fn((_command, args, _options, callback) => {
    if (args[1] === 'list' && attempts++ === 0) return callback(new Error('temporary'), '', '');
    callback(null, JSON.stringify(args[1] === 'list' ? [run] : details), '');
  });
  await expect(pollReleaseCi({ ...options, execFile, maxPolls: 2 })).resolves.toMatchObject({ databaseId: 5 });
  expect(options.sleep).toHaveBeenCalled();
});

test('waits through a pending detail until the next poll', async () => {
  let views = 0;
  const run = { databaseId: 6, createdAt: '2026-01-01', headSha: 'abc', headBranch: 'v1.0.0' };
  const execFile = jest.fn((_command, args, _options, callback) => {
    const details =
      args[1] === 'list'
        ? [run]
        : views++ === 0
          ? { databaseId: 6, status: 'in_progress', conclusion: null, headSha: 'abc', jobs: [] }
          : { databaseId: 6, status: 'completed', conclusion: 'success', headSha: 'abc', jobs: [] };
    callback(null, JSON.stringify(details), '');
  });
  await expect(pollReleaseCi({ ...options, execFile, maxPolls: 2 })).resolves.toMatchObject({
    databaseId: 6,
    status: 'completed',
  });
});

test('polls when the release workflow has not appeared yet', async () => {
  let lists = 0;
  const run = { databaseId: 7, createdAt: '2026-01-01', headSha: 'abc', headBranch: 'v1.0.0' };
  const details = { databaseId: 7, status: 'completed', conclusion: 'success', headSha: 'abc', jobs: [] };
  const execFile = jest.fn((_command, args, _options, callback) =>
    callback(null, JSON.stringify(args[1] === 'list' ? (lists++ === 0 ? [] : [run]) : details), ''),
  );
  await expect(pollReleaseCi({ ...options, execFile, maxPolls: 2 })).resolves.toMatchObject({ databaseId: 7 });
});
