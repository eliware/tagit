import { readRepositoryExceptions } from '../../../src/repository/metadata/read-exceptions.mjs';

test('reads explicit inapplicable path reasons', () => {
  const fs = { existsSync: () => true, readFileSync: () => JSON.stringify({ inapplicable: { 'examples/': 'CLI-only package has no runnable examples.' } }) };
  expect(readRepositoryExceptions(fs)).toEqual({ 'examples/': 'CLI-only package has no runnable examples.' });
});

test('rejects malformed exception files', () => {
  expect(() => readRepositoryExceptions({ existsSync: () => true, readFileSync: () => '{}' })).toThrow('inapplicable');
  expect(() => readRepositoryExceptions({ existsSync: () => true, readFileSync: () => JSON.stringify({ inapplicable: { 'docs/': '' } }) })).toThrow('non-empty reason');
});
