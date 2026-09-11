import { jest } from '@jest/globals';
import { reportCiResult } from '../../../src/commands/release-wait/report-ci-result.mjs';

test('reports links-only CI results', () => {
  const log = { info: jest.fn() };
  const run = { databaseId: 42 };
  expect(reportCiResult({ log, repo: 'eliware/demo', tag: 'v1.2.3', headSha: 'abc', run, linksOnly: true })).toEqual({
    repo: 'eliware/demo',
    tag: 'v1.2.3',
    headSha: 'abc',
    runId: 42,
    linksOnly: true,
  });
});

test('does not report links for full verification', () => {
  expect(
    reportCiResult({ log: { info: jest.fn() }, repo: 'x', tag: 'v1', headSha: 'a', run: {}, linksOnly: false }),
  ).toBe(false);
});
