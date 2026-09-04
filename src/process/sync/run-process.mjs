export function runProcess(execFileSync, executable, args = [], options = {}) {
  if (typeof execFileSync !== 'function') throw new TypeError('A synchronous process runner is required.');
  if (typeof executable !== 'string' || !executable) throw new TypeError('A process executable is required.');
  if (!Array.isArray(args)) throw new TypeError('Process arguments must be an array.');
  return execFileSync(executable, args, options);
}
