export async function execFileCommand(execFile, executable, args, options = { encoding: 'utf8' }) {
  if (typeof execFile !== 'function') throw new TypeError('An execFile runner is required.');
  if (!Array.isArray(args)) throw new TypeError('Release command arguments must be an array.');
  return new Promise((resolve, reject) => {
    execFile(executable, args, options, (error, stdout, stderr) => {
      if (error) { error.stdout = stdout; error.stderr = stderr; reject(error); return; }
      resolve(stdout);
    });
  });
}
