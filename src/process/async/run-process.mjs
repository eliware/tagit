export async function runProcessAsync(execFile, executable, args = [], options = {}) {
  if (typeof execFile !== 'function') throw new TypeError('An asynchronous process runner is required.');
  if (typeof executable !== 'string' || !executable) throw new TypeError('A process executable is required.');
  if (!Array.isArray(args)) throw new TypeError('Process arguments must be an array.');
  return new Promise((resolve, reject) => {
    execFile(executable, args, options, (error, stdout, stderr) => {
      if (error) {
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}
