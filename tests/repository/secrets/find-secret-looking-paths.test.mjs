import { findSecretLookingPaths, secretFilesMessage } from '../../../src/repository/secrets/find-secret-looking-paths.mjs';

test('finds secret-looking tracked paths and formats the failure', () => {
  const files = findSecretLookingPaths('.env\n.env.example\nconfig/credentials.json\nsrc/index.mjs');
  expect(files).toEqual(['.env', 'config/credentials.json']);
  expect(secretFilesMessage(files)).toContain('credentials.json');
});
