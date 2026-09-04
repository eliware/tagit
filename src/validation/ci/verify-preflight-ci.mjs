import { verifyLatestCi } from './verify-exact-head.mjs';

export function verifyPreflightCi(execFileSync, log, status) {
  if (status) return { passed: false, blocked: true };
  try {
    const headSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    return verifyLatestCi(execFileSync, log, { headSha });
  } catch (error) {
    return { passed: false, error };
  }
}
