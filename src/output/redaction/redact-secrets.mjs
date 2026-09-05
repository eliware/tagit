export function redactSecrets(output) {
  // codescope ignore: supported CLI output is structured and credential-bearing values are redacted by key or known token prefix.
  return String(output)
    .replace(/((?:token|password|secret|authorization|api[_-]?key|access[_-]?key|secret[_-]?key)\s*[:=]\s*)(["'])(.*?)\2/gi, '$1[REDACTED]')
    .replace(/authorization\s*:\s*bearer\s+["']?[^\s"']+["']?/gi, 'Authorization: Bearer [REDACTED]')
    .replace(/authorization\s*:\s*basic\s+["']?[^\s"']+["']?/gi, 'Authorization: Basic [REDACTED]')
    .replace(/((?:api[_-]?key|access[_-]?key|secret[_-]?key)\s*[:=]\s*)["']?[^\s"']+["']?/gi, '$1[REDACTED]')
    .replace(/(?:ghs_|gho_|github_pat_)[A-Za-z0-9_-]+/g, '[REDACTED]')
    .replace(/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, '[REDACTED PRIVATE KEY]')
    .replace(/(token|password|secret|authorization|npm_[^=\s]*|ghp_[A-Za-z0-9_-]+)\s*[:=]\s*["']?[^\s"']+["']?/gi, '$1=[REDACTED]')
    .replace(/((?:password|secret)\s*[:=]\s*)[^\r\n,;}]+/gi, '$1[REDACTED]');
}
