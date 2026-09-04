import { pollGhcrVisibility } from '../../../src/registries/ghcr/poll-visibility.mjs';

function execWith(value) {
  return (command, args, options, callback) => callback(null, JSON.stringify(value), '');
}

test('finds the version-tagged image', async () => {
  const execFile = execWith([[{ metadata: { container: { tags: ['v2.0.0'] } }, name: 'image' }]]);
  await expect(pollGhcrVisibility(execFile, {}, { owner: 'eliware', imageName: 'tagit', version: '2.0.0', retries: 1, retryMs: 0, sleep: async () => {} })).resolves.toMatchObject({ name: 'image' });
});

test('reports unavailable images after the retry budget', async () => {
  const execFile = execWith([]);
  await expect(pollGhcrVisibility(execFile, {}, { owner: 'eliware', imageName: 'tagit', version: '2.0.0', retries: 1, retryMs: 0, sleep: async () => {} })).rejects.toThrow('does not expose');
});
