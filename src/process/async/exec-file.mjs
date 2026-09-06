export async function execFileCommand(
  execFile,
  executable,
  args,
  options = { encoding: 'utf8' },
  platform = process.platform,
) {
  if (typeof execFile !== 'function') throw new TypeError('An execFile runner is required.');
  if (!Array.isArray(args)) throw new TypeError('Release command arguments must be an array.');
  return new Promise((resolve, reject) => {
    const windowsNpm = platform === 'win32' && executable === 'npm.cmd';
    const command = windowsNpm ? 'cmd.exe' : executable;
    const commandArgs = windowsNpm ? ['/d', '/s', '/c', executable, ...args] : args;
    const commandOptions = windowsNpm ? { ...options, windowsVerbatimArguments: true } : options;
    execFile(command, commandArgs, commandOptions, (error, stdout, stderr) => {
      if (error) {
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
}
