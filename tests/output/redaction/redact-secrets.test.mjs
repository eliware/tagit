import { redactSecrets } from '../../../src/output/redaction/redact-secrets.mjs';

test('redacts authorization and token-like values', () => {
  expect(redactSecrets('Authorization: Bearer abc token=secret ghp_value')).toContain('[REDACTED]');
  expect(redactSecrets('Authorization: Bearer abc token=secret ghp_value')).not.toContain('abc');
});
