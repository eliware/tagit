import { verifyPublishJob } from '../../../src/commands/release-wait/verify-publish-job.mjs';

test('returns publish jobs when the public package publish passed', () => {
  const jobs = [{ name: 'publish', status: 'completed', conclusion: 'success' }];
  expect(verifyPublishJob(jobs, { applicable: true, packageName: 'demo', isPrivate: false })).toEqual(jobs);
});

test('requires a publish job for public packages', () => {
  expect(() =>
    verifyPublishJob([{ name: 'test', conclusion: 'success' }], {
      applicable: true,
      packageName: 'demo',
      isPrivate: false,
    }),
  ).toThrow('successful publish job');
  expect(verifyPublishJob([], { applicable: false, packageName: null, isPrivate: null })).toEqual([]);
});
test('does not accept publish-adjacent job names', () => {
  expect(() =>
    verifyPublishJob([{ name: 'publish image', status: 'completed', conclusion: 'success' }], {
      applicable: true,
      packageName: 'demo',
      isPrivate: false,
    }),
  ).toThrow('successful publish job');
});
test('rejects a non-completed publish job', () => {
  expect(() =>
    verifyPublishJob([{ name: 'publish', status: 'in_progress', conclusion: '' }], {
      applicable: true,
      packageName: 'demo',
      isPrivate: false,
    }),
  ).toThrow('successful publish job');
});
