import { jest } from '@jest/globals';
import { assembleDependencies } from '../../../src/cli/application/assemble-dependencies.mjs';

test('merges injected dependencies over defaults', () => {
  const log = { error: jest.fn() };
  expect(assembleDependencies({ log }).log).toBe(log);
  expect(assembleDependencies().fs).toBeDefined();
});
