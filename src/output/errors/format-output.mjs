import { redactSecrets } from '../redaction/redact-secrets.mjs';
import { truncateOutput } from '../redaction/truncate-output.mjs';

export function outputText(output) {
  return truncateOutput(redactSecrets(output));
}
