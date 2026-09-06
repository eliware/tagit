import { validateMetadata } from '../../src/repository/validate-metadata.mjs';

test('reports missing required files and metadata', () => {
  const failures = [];
  validateMetadata({ existsSync: (file) => file === 'package.json', readFileSync: () => JSON.stringify({}) }, failures);
  expect(failures.join('\n')).toMatch(/missing|required/);
});

test('reports malformed package metadata', () => {
  const failures = [];
  validateMetadata({ existsSync: () => true, readFileSync: () => '{bad' }, failures);
  expect(failures.join('\n')).toContain('package metadata validation failed');
});
