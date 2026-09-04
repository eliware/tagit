import { jest } from '@jest/globals';
import { buildTestCheck } from '../../../src/validation/local/test-command.mjs';

test('builds the shared npm test check and coverage waiver form', () => {
  const fs = { existsSync: jest.fn(() => true), readFileSync: jest.fn(() => JSON.stringify({ scripts: { test: 'eliware-test' } })) };
  expect(buildTestCheck(fs).check).toEqual(['test', ['npm', ['test']]]);
  expect(buildTestCheck(fs, true).check).toEqual(['test', ['npm', ['test', '--', '--ignore-100x4']]]);
});

test('reports missing package or test script', () => {
  expect(buildTestCheck({ existsSync: jest.fn(() => false) })).toEqual({ missing: false, check: null });
  expect(buildTestCheck({ existsSync: jest.fn(() => true), readFileSync: jest.fn(() => JSON.stringify({ scripts: {} })) })).toEqual({ missing: true, check: null });
});
