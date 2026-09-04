import { resolveExecutable } from '../../process/commands/resolve-executable.mjs';

export function processCommand(executable, args, platform = process.platform) {
  return [resolveExecutable(executable, platform), args];
}
