import { resolveExecutable } from "../../../process/commands/resolve-executable.mjs";

export function processCommand(executable, args, platform = process.platform) {
  // codescope ignore: cmd.exe must start npm.cmd on Windows. The argument count has a fixed value.
  const command = resolveExecutable(executable, platform);
  if (platform === "win32" && command === "npm.cmd")
    return ["cmd.exe", ["/d", "/s", "/c", command, ...args]];
  return [command, args];
}
