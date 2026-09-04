import { verifyPublishJob } from '../../../src/commands/release-wait/verify-publish-job.mjs';

const successful = job => job.conclusion === 'success';

test('returns publish jobs when the public package publish passed', () => {
  const jobs = [{ name: 'publish', conclusion: 'success' }];
  expect(verifyPublishJob(jobs, successful, 'demo', false)).toEqual(jobs);
});

test('requires a publish job for public packages', () => {
  expect(() => verifyPublishJob([{ name: 'test', conclusion: 'success' }], successful, 'demo', false)).toThrow('successful publish job');
  expect(verifyPublishJob([], successful, null, false)).toEqual([]);
});
