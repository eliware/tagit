import { buildWindowsNpmCommand } from "../../process/commands/windows/npm.mjs";

export function buildNpmCommand(args, platform = process.platform) {
  if (platform === "win32") return buildWindowsNpmCommand(args);
  return { executable: "npm", args, options: { encoding: "utf8" } };
}
