import { jest } from '@jest/globals';
test('tagit.mjs can be imported without error', async () => {
  process.env.LOG_LEVEL = 'none';
  await import('../tagit.mjs');
  expect(true).toBe(true);
});