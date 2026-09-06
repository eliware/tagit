import { redactSecrets } from '../../../src/output/redaction/redact-secrets.mjs';

test('redacts authorization and token-like values', () => {
  expect(redactSecrets('Authorization: Bearer abc token=secret ghp_value')).toContain('[REDACTED]');
  expect(redactSecrets('Authorization: Bearer abc token=secret ghp_value')).not.toContain('abc');
});
test('redacts unlabelled npm access tokens', () => {
  expect(redactSecrets('npm_123456789012345678901234567890')).toBe('[REDACTED]');
});
test('redacts complete quoted values containing whitespace', () => {
  expect(redactSecrets('token="a b c"')).toBe('token=[REDACTED]');
});
