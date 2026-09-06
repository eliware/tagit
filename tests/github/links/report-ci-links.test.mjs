import { jest } from '@jest/globals';
import { reportCiLinks } from '../../../src/github/links/report-ci-links.mjs';

const log = () => ({ info: jest.fn() });
test('reports exact-HEAD workflow and job links', () => {
  const exec = jest.fn((command, args) => command === 'git' ? 'https://github.com/eliware/tagit.git\n' : args[1] === 'list' ? JSON.stringify([{ databaseId: 7, url: 'https://ci/7', headSha: 'abc' }]) : JSON.stringify({ jobs: [{ name: 'Ubuntu', url: 'https://ci/7/jobs/1' }] }));
  const logger = log();
  expect(reportCiLinks(exec, logger, 'abc')).toMatchObject({ repo: 'eliware/tagit', headSha: 'abc' });
  expect(logger.info).toHaveBeenCalledWith('Workflow: [https://ci/7](https://ci/7)');
});
test('reports absent CI, retries, and rejects invalid remotes', () => {
  const exec = jest.fn((command) => command === 'git' ? 'https://github.com/eliware/tagit.git' : '[]');
  expect(reportCiLinks(exec, log(), 'abc', { attempts: 2, delayMs: 0 })).toMatchObject({ runs: [] });
  expect(() => reportCiLinks(jest.fn(() => 'local-only'), log(), 'abc')).toThrow('Cannot determine');
});
test('handles missing job links and job arrays', () => {
  const exec = jest.fn((command, args) => command === 'git' ? 'git@github.com:eliware/tagit.git' : args[1] === 'list' ? JSON.stringify([{ databaseId: 8, url: 'https://ci/8', headSha: 'abc' }]) : JSON.stringify({ jobs: null }));
  expect(() => reportCiLinks(exec, log(), 'abc')).toThrow('malformed job records');
  const noLink = jest.fn((command, args) => command === 'git' ? 'git@github.com:eliware/tagit.git' : args[1] === 'list' ? JSON.stringify([{ databaseId: 9, url: 'https://ci/9', headSha: 'abc' }]) : JSON.stringify({ jobs: [{ name: 'metadata-only' }] }));
  expect(reportCiLinks(noLink, log(), 'abc')).toMatchObject({ runs: [{ databaseId: 9 }] });
});
test('rejects invalid bounds and malformed responses', () => {
  expect(() => reportCiLinks(jest.fn(() => 'https://github.com/eliware/tagit.git'), log(), 'abc', { attempts: 0 })).toThrow('attempts');
  expect(() => reportCiLinks(jest.fn(() => 'https://github.com/eliware/tagit.git'), log(), 'abc', { delayMs: -1 })).toThrow('delay');
  const malformed = jest.fn((command) => command === 'git' ? 'https://github.com/eliware/tagit.git' : JSON.stringify({ runs: [] }));
  expect(() => reportCiLinks(malformed, log(), 'abc')).toThrow('must be an array');
});
test('rejects malformed individual run records', () => {
  const malformed = jest.fn((command) => command === 'git' ? 'https://github.com/eliware/tagit.git' : JSON.stringify([{ databaseId: 'bad', url: 'https://ci', headSha: 'abc' }]));
  expect(() => reportCiLinks(malformed, log(), 'abc')).toThrow('malformed run records');
});
test('rejects malformed individual job records', () => {
  const malformed = jest.fn((command, args) => command === 'git' ? 'https://github.com/eliware/tagit.git' : args[1] === 'list' ? JSON.stringify([{ databaseId: 10, url: 'https://ci/10', headSha: 'abc' }]) : JSON.stringify({ jobs: [null, 42, { url: 'https://ci/job' }] }));
  expect(() => reportCiLinks(malformed, log(), 'abc')).toThrow('malformed job records');
});
