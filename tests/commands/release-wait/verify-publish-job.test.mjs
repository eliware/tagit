import { verifyPublishJob } from '../../../src/commands/release-wait/verify-publish-job.mjs';

const successful = job => job.conclusion === 'success';

test('returns publish jobs when the public package publish passed', () => {
  const jobs = [{ name: 'publish', status: 'completed', conclusion: 'success' }];
  expect(verifyPublishJob(jobs, successful, { applicable: true, packageName: 'demo', isPrivate: false })).toEqual(jobs);
});

test('requires a publish job for public packages', () => {
  expect(() => verifyPublishJob([{ name: 'test', conclusion: 'success' }], successful, { applicable: true, packageName: 'demo', isPrivate: false })).toThrow('successful publish job');
  expect(verifyPublishJob([], successful, { applicable: false, packageName: null, isPrivate: null })).toEqual([]);
});
test('does not accept publish-adjacent job names', () => {
  expect(() => verifyPublishJob([{ name: 'publish image', status: 'completed', conclusion: 'success' }], successful, { applicable: true, packageName: 'demo', isPrivate: false })).toThrow('successful publish job');
});
