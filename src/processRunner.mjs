import { execFileSync as defaultExecFileSync } from 'node:child_process';

/**
 * Execute a program without invoking a shell.
 *
 * Keeping the executable and arguments separate prevents command or argument
 * interpolation from becoming shell syntax, while the injected runner keeps
 * callers straightforward to test.
 */
export function runProcess(execFileSync = defaultExecFileSync, executable, args = [], options = {}) {
  if (typeof executable !== 'string' || !executable) {
    throw new TypeError('A process executable is required.');
  }
  if (!Array.isArray(args)) throw new TypeError('Process arguments must be an array.');
  return execFileSync(executable, args, options);
}
