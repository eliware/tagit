import { releaseLinks } from '../../../src/commands/release-wait/release-links.mjs';

test('formats workflow, platform, and publication links', () => {
  expect(releaseLinks({ url: 'workflow', jobs: [{ name: 'ubuntu', status: 'completed', conclusion: 'success', url: 'ubuntu' }] }, [], [{ name: 'publish', url: 'publish' }]))
    .toEqual([['Workflow', 'workflow'], ['Ubuntu', 'ubuntu'], ['Publish', 'publish']]);
});

test('numbers multiple publication links', () => {
  expect(releaseLinks({ url: 'workflow', jobs: [] }, [], [{ name: 'publish', url: 'one' }, { name: 'publish ghcr', url: 'two' }]))
    .toEqual([['Workflow', 'workflow'], ['Publish 1', 'one'], ['Publish 2', 'two']]);
});
