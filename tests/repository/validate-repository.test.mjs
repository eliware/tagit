import { jest } from '@jest/globals';
import { validateRepository } from '../../src/repository/validate-repository.mjs';

test('accepts complete metadata on main without secret-looking files', () => {
  const exec = (command, args) => args[0] === 'branch' ? 'main' : 'package.json\n';
  const fs = { existsSync: () => true, readFileSync: () => JSON.stringify({ name: 'demo', version: '1.0.0', description: 'demo', license: 'MIT' }) };
  const failures = [];
  validateRepository(exec, fs, failures);
  expect(failures).toEqual([]);
});

test('reports missing metadata, required files, and tracked secret paths', () => {
  const exec = (command, args) => args[0] === 'branch' ? 'feature' : '.env\ncredentials.json';
  const fs = { existsSync: file => file === 'package.json', readFileSync: () => JSON.stringify({}) };
  const failures = [];
  validateRepository(exec, fs, failures);
  expect(failures.join('\n')).toMatch(/main|missing|required|secret-looking/);
});

test('reports inspection failures from Git and malformed metadata', () => {
  const exec = jest.fn((command, args) => { if (args[0] !== 'status') throw new Error('inspection failed'); return ''; });
  const fs = { existsSync: jest.fn(() => false), readFileSync: jest.fn(() => '{bad') };
  const failures = [];
  validateRepository(exec, fs, failures);
  expect(failures.join('\n')).toMatch(/branch validation|package metadata validation|tracked-file validation/);
});

test('reports a detached worktree explicitly', () => {
  const failures = [];
  validateRepository((command, args) => args[0] === 'branch' ? '' : '', { existsSync: () => true, readFileSync: () => JSON.stringify({ name: 'x', version: '1', description: 'x', license: 'MIT' }) }, failures);
  expect(failures.join('\n')).toContain('detached');
});
