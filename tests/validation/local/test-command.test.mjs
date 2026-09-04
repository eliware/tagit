import { jest } from '@jest/globals';
import { buildTestCheck, invokesEliwareTest } from '../../../src/validation/local/test-command.mjs';

test('builds the shared npm test check and coverage waiver form', () => {
  const fs = { existsSync: jest.fn(() => true), lstatSync: jest.fn(() => ({ isSymbolicLink: () => false })), readFileSync: jest.fn(() => JSON.stringify({ name: 'demo', devDependencies: { '@eliware/test': '^3.0.0' }, scripts: { test: 'eliware-test' } })) };
  expect(buildTestCheck(fs).check).toEqual(['test', ['npm', ['test']]]);
  expect(buildTestCheck({ ...fs, readFileSync: () => JSON.stringify({ name: 'demo', devDependencies: { '@eliware/test': '^3.0.0' }, scripts: { test: 'eliware-test' } }) }).check).toEqual(['test', ['npm', ['test']]]);
  expect(buildTestCheck(fs, { ignore100x4: true }).check).toEqual(['test', ['npm', ['test', '--', '--ignore-100x4']]]);
  expect(buildTestCheck(fs, { ignoreMonolithLimits: true }).check).toEqual(['test', ['npm', ['test', '--', '--ignore-monolith-limits']]]);
  expect(buildTestCheck(fs, { ignore100x4: true, ignoreMonolithLimits: true }).check).toEqual(['test', ['npm', ['test', '--', '--ignore-100x4', '--ignore-monolith-limits']]]);
});

test('reports missing package or test script', () => {
  expect(buildTestCheck({ existsSync: jest.fn(() => false) })).toEqual({ missing: false, check: null });
  expect(buildTestCheck({ existsSync: jest.fn(() => true), readFileSync: jest.fn(() => JSON.stringify({ scripts: {} })) })).toEqual({ missing: true, check: null });
});

test('accepts the shared harness command and its Node wrapper form', () => {
  expect(invokesEliwareTest('eliware-test')).toBe(true);
  expect(invokesEliwareTest('node bin/eliware-test.mjs')).toBe(true);
  const fs = { existsSync: () => true, lstatSync: () => ({ isSymbolicLink: () => false }), readFileSync: () => JSON.stringify({ name: 'demo', devDependencies: { '@eliware/test': '^3.0.0' }, scripts: { test: 'node bin/eliware-test.mjs' } }) };
  expect(buildTestCheck(fs).invalid).toBe(true);
});

test('rejects an unrelated successful test command', () => {
  expect(invokesEliwareTest('jest')).toBe(false);
  expect(buildTestCheck({ existsSync: () => true, readFileSync: () => JSON.stringify({ name: 'demo', devDependencies: { '@eliware/test': '^3.0.0' }, scripts: { test: 'jest' } }) })).toEqual({ missing: false, invalid: true, check: null });
});

test('rejects a missing or linked shared harness dependency', () => {
  const packageData = JSON.stringify({ name: 'demo', devDependencies: { '@eliware/test': '^3.0.0' }, scripts: { test: 'eliware-test' } });
  expect(buildTestCheck({ existsSync: file => file !== 'node_modules/@eliware/test/package.json', readFileSync: () => packageData })).toMatchObject({ invalid: true });
  expect(buildTestCheck({ existsSync: () => true, lstatSync: () => ({ isSymbolicLink: () => true }), readFileSync: () => packageData })).toMatchObject({ invalid: true });
});

test('allows the shared harness package to run its own test command', () => {
  const fs = { existsSync: () => true, readFileSync: () => JSON.stringify({ name: '@eliware/test', scripts: { test: 'node bin/eliware-test.mjs' } }) };
  expect(buildTestCheck(fs).check).toEqual(['test', ['npm', ['test']]]);
});
