import { jest } from '@jest/globals';
import { reportReleaseLinks } from '../../../src/commands/release-wait/report-release-links.mjs';
test('reports workflow and available job links', () => {
  const log = { info: jest.fn() };
  reportReleaseLinks(log, 'eliware/tagit', 'v1.2.3', { url: 'workflow', jobs: [{ name: 'Ubuntu', url: 'job' }] });
  expect(log.info).toHaveBeenCalledWith('Workflow: [workflow](workflow)');
  expect(log.info).toHaveBeenCalledWith('Ubuntu: [job](job)');
});
test('handles a run without optional job links', () => {
  const log = { info: jest.fn() };
  reportReleaseLinks(log, 'eliware/demo', 'v1.0.0', { url: 'workflow' });
  expect(log.info).toHaveBeenCalledTimes(2);
});
