export function redactSecrets(output) {
  return String(output)
    .replace(/authorization\s*:\s*bearer\s+["']?[^\s"']+["']?/gi, 'Authorization: Bearer [REDACTED]')
    .replace(/(?:ghs_|gho_|github_pat_)[A-Za-z0-9_-]+/g, '[REDACTED]')
    .replace(/(token|password|secret|authorization|npm_[^=\s]*|ghp_[A-Za-z0-9_-]+)\s*[:=]\s*["']?[^\s"']+["']?/gi, '$1=[REDACTED]');
}
