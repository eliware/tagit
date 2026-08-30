import { execFileSync as defaultExecFileSync } from 'node:child_process';
import { execFile as defaultExecFile } from 'node:child_process';

/**
 * Process-runner contract: callers provide an executable and an argument array
 * separately; options are passed directly to Node's child-process API. Shell
 * strings and shell options are intentionally outside this interface.
 */
export function runProcess(execFileSync = defaultExecFileSync, executable, args = [], options = {}) {
  if (typeof executable !== 'string' || !executable) {
    throw new TypeError('A process executable is required.');
  }
  if (!Array.isArray(args)) throw new TypeError('Process arguments must be an array.');
  return execFileSync(executable, args, options);
}

export function resolveExecutable(executable, platform = process.platform) {
  if (platform !== 'win32') return executable;
  return ['npm', 'npx', 'composer'].includes(executable) ? `${executable}.cmd` : executable;
}

export async function runProcessAsync(execFile, executable, args = [], options = {}) {
  if (typeof executable !== 'string' || !executable) throw new TypeError('A process executable is required.');
  if (!Array.isArray(args)) throw new TypeError('Process arguments must be an array.');
  return new Promise((resolve, reject) => {
    execFile(executable, args, options, (error, stdout, stderr) => {
      if (error) { error.stdout = stdout; error.stderr = stderr; reject(error); return; }
      resolve({ stdout, stderr });
    });
  });
}
