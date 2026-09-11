import { jest } from '@jest/globals';
import { reportReleaseFailure } from '../../../src/git/release/report-release-failure.mjs';

test('reports failures before and after remote side effects', () => {
  const log = { error: jest.fn() };
  const error = new Error('failed');
  expect(reportReleaseFailure(log, error, false)).toBe(error);
  expect(reportReleaseFailure(log, error, true)).toBe(error);
  expect(log.error).toHaveBeenNthCalledWith(1, 'Release tag operation failed before remote side effects.');
  expect(log.error).toHaveBeenNthCalledWith(
    2,
    'Tag push failed after remote side effects; local files were preserved for reconciliation.',
  );
});
