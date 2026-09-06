import { readPackageJson } from '../../../src/repository/metadata/read-package-json.mjs';

test('reads and parses package metadata', () => {
  expect(readPackageJson({ readFileSync: () => '{"name":"demo"}' })).toEqual({ name: 'demo' });
});
test('reports malformed package metadata', () => {
  expect(() => readPackageJson({ readFileSync: () => '{bad' })).toThrow();
});
