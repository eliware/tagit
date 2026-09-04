import { missingMetadataMessage, missingPackageMetadata } from '../../../src/repository/metadata/validate-package-metadata.mjs';

test('finds missing package metadata', () => {
  expect(missingPackageMetadata({ name: 'demo', license: 'MIT' })).toEqual(['version', 'description']);
  expect(missingMetadataMessage('version')).toContain('version');
});
