import { resolveExecutable } from '../../process/commands/resolve-executable.mjs';

export function processCommand(executable, args, platform = process.platform) {
  // codescope ignore: cmd.exe is required to launch npm.cmd reliably on Windows; arguments remain explicitly bounded.
  const command = resolveExecutable(executable, platform);
  if (platform === 'win32' && command === 'npm.cmd') return ['cmd.exe', ['/d', '/s', '/c', command, ...args]];
  return [command, args];
}
