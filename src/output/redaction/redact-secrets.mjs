import { redactText } from '@eliware/redact';

export function redactSecrets(output) {
  return redactText(output, { maxString: 10000 });
}
